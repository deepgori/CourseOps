import { format, startOfMonth, subMonths, subWeeks } from 'date-fns';
import { Activity } from '../models/Activity.js';
import { Asset } from '../models/Asset.js';
import { Course, COURSE_DEPARTMENTS, COURSE_STATUSES } from '../models/Course.js';
import { decorateCourse } from '../utils/courseInsights.js';

const getQuarterWindow = (date) => {
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const quarterStart = new Date(date.getFullYear(), quarterStartMonth, 1);
  const nextQuarterStart = new Date(date.getFullYear(), quarterStartMonth + 3, 1);
  return { quarterStart, nextQuarterStart };
};

const fillMonthlyData = (records) => {
  const lookup = new Map(records.map((item) => [item.label, item.total]));

  return Array.from({ length: 12 }).map((_, index) => {
    const monthDate = startOfMonth(subMonths(new Date(), 11 - index));
    const label = format(monthDate, 'MMM');
    return {
      label,
      total: lookup.get(label) || 0
    };
  });
};

const summarizeDepartment = (department, courses) => {
  const items = courses.filter((course) => course.department === department);
  const total = items.length;
  const completed = items.filter((course) => course.status === 'Published').length;
  const inProgress = items.filter((course) => course.status !== 'Published').length;
  const overdue = items.filter((course) => course.metrics.isOverdue).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const averageHealth = total
    ? Math.round(items.reduce((sum, course) => sum + course.metrics.healthScore, 0) / total)
    : 0;
  const averageAccessibility = total
    ? Math.round(items.reduce((sum, course) => sum + course.metrics.accessibilityProgress, 0) / total)
    : 0;

  const breakdown = COURSE_STATUSES.reduce(
    (accumulator, status) => ({
      ...accumulator,
      [status]: items.filter((course) => course.status === status).length
    }),
    {}
  );

  return {
    department,
    totalCourses: total,
    completed,
    inProgress,
    overdue,
    completionRate,
    averageHealth,
    averageAccessibility,
    ...breakdown
  };
};

export const getOverviewReport = async (_req, res, next) => {
  try {
    const now = new Date();
    const { quarterStart, nextQuarterStart } = getQuarterWindow(now);
    const previousQuarterStart = new Date(quarterStart);
    previousQuarterStart.setMonth(previousQuarterStart.getMonth() - 3);

    const [coursesRaw, completedThisQuarter, completedLastQuarter, pipelineRaw, assetTrendRaw] =
      await Promise.all([
        Course.find().populate('assets'),
        Course.countDocuments({
          publishedAt: { $gte: quarterStart, $lt: nextQuarterStart }
        }),
        Course.countDocuments({
          publishedAt: { $gte: previousQuarterStart, $lt: quarterStart }
        }),
        Course.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]),
        Asset.aggregate([
          {
            $match: {
              createdAt: { $gte: subWeeks(now, 11) }
            }
          },
          {
            $group: {
              _id: {
                year: { $isoWeekYear: '$createdAt' },
                week: { $isoWeek: '$createdAt' }
              },
              total: { $sum: 1 }
            }
          }
        ])
      ]);

    const courses = coursesRaw.map((course) => decorateCourse(course));
    const totalCourses = courses.length;
    const activeCourses = courses.filter((course) => course.status !== 'Published').length;
    const inProduction = courses.filter((course) =>
      ['Draft', 'In Development', 'In Review'].includes(course.status)
    ).length;
    const overdue = courses.filter((course) => course.metrics.isOverdue).length;
    const atRiskCourses = courses.filter((course) => course.metrics.riskLevel === 'High').length;
    const automatedReviews = courses.filter((course) => course.automation?.reviewAutoAssigned).length;
    const accessibilityAverage = totalCourses
      ? Math.round(
          courses.reduce((sum, course) => sum + course.metrics.accessibilityProgress, 0) / totalCourses
        )
      : 0;

    const pipeline = COURSE_STATUSES.map((status) => ({
      status,
      total: pipelineRaw.find((item) => item._id === status)?.total || 0
    }));

    const assetLookup = new Map(
      assetTrendRaw.map((item) => [`${item._id.year}-${item._id.week}`, item.total])
    );

    const assetUploadTrend = Array.from({ length: 12 }).map((_, index) => {
      const pointDate = subWeeks(now, 11 - index);
      const weekKey = `${format(pointDate, 'RRRR')}-${format(pointDate, 'I')}`;
      return {
        label: `W${format(pointDate, 'I')}`,
        total: assetLookup.get(weekKey) || 0
      };
    });

    const atRiskSnapshot = [...courses]
      .sort((left, right) => left.metrics.healthScore - right.metrics.healthScore)
      .slice(0, 4)
      .map((course) => ({
        _id: course._id,
        code: course.code,
        title: course.title,
        assignee: course.assignee.name,
        healthScore: course.metrics.healthScore,
        riskLevel: course.metrics.riskLevel,
        recommendation: course.metrics.recommendation
      }));

    res.json({
      stats: {
        totalCourses,
        activeCourses,
        inProduction,
        inProductionPercent: totalCourses ? Math.round((inProduction / totalCourses) * 100) : 0,
        completedThisQuarter,
        completedDelta: completedThisQuarter - completedLastQuarter,
        overdue,
        atRiskCourses,
        accessibilityAverage,
        automatedReviews
      },
      pipeline,
      statusDistribution: pipeline,
      assetUploadTrend,
      atRiskSnapshot
    });
  } catch (error) {
    next(error);
  }
};

export const getCompletionReport = async (_req, res, next) => {
  try {
    const monthlyRaw = await Course.aggregate([
      {
        $match: {
          publishedAt: { $gte: startOfMonth(subMonths(new Date(), 11)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$publishedAt' },
            month: { $month: '$publishedAt' }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formatted = monthlyRaw.map((item) => ({
      label: format(new Date(item._id.year, item._id.month - 1, 1), 'MMM'),
      total: item.total
    }));

    res.json(fillMonthlyData(formatted));
  } catch (error) {
    next(error);
  }
};

export const getDepartmentReport = async (_req, res, next) => {
  try {
    const courses = (await Course.find().lean()).map((course) => decorateCourse(course));
    const summary = COURSE_DEPARTMENTS.map((department) => summarizeDepartment(department, courses));

    res.json({
      breakdown: summary.map((item) => ({
        department: item.department,
        Draft: item.Draft,
        'In Development': item['In Development'],
        'In Review': item['In Review'],
        Published: item.Published
      })),
      summary
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityReport = async (_req, res, next) => {
  try {
    const activity = await Activity.find().sort({ timestamp: -1 }).limit(10);
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (_req, res, next) => {
  try {
    const courses = (await Course.find().lean()).map((course) => decorateCourse(course));
    const rows = COURSE_DEPARTMENTS.map((department) => {
      const summary = summarizeDepartment(department, courses);

      return [
        summary.department,
        summary.totalCourses,
        summary.completed,
        summary.inProgress,
        summary.overdue,
        `${summary.completionRate}%`,
        summary.averageHealth,
        `${summary.averageAccessibility}%`
      ].join(',');
    });

    const csv = [
      'Department,Total Courses,Completed,In Progress,Overdue,Completion Rate,Average Health,Accessibility Progress',
      ...rows
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="courseops-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
