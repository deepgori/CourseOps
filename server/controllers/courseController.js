import { Activity } from '../models/Activity.js';
import { Asset } from '../models/Asset.js';
import { Course } from '../models/Course.js';
import { decorateCourse, getCourseTarget } from '../utils/courseInsights.js';
import { qaReviewer } from '../utils/teamMembers.js';

const recordActivity = async ({ action, course, user, target, targetId, targetType = 'course' }) => {
  await Activity.create({
    action,
    target: target || (course ? getCourseTarget(course) : ''),
    targetId: targetId || course?._id || null,
    targetType,
    user,
    timestamp: new Date()
  });
};

const syncPublishedAt = (course, nextStatus) => {
  if (nextStatus === 'Published' && !course.publishedAt) {
    course.publishedAt = new Date();
  }

  if (nextStatus !== 'Published') {
    course.publishedAt = null;
  }
};

const applyWorkflowAutomation = async (course, previousStatus) => {
  if (course.status === 'In Review' && previousStatus !== 'In Review' && qaReviewer) {
    const needsQaAssignment = course.assignee.role !== 'QA Reviewer';

    if (needsQaAssignment) {
      course.assignee = qaReviewer;
      course.automation.reviewAutoAssigned = true;
      course.automation.lastAutoAssignedAt = new Date();

      await recordActivity({
        action: 'auto-routed for QA review',
        course,
        user: 'CourseOps Automation'
      });
    }
  }
};

const getCourseActivity = async (courseId) =>
  Activity.find({
    $or: [{ targetId: courseId }, { targetType: 'course', targetId: courseId }]
  })
    .sort({ timestamp: -1 })
    .limit(8);

const buildDetailedCourseResponse = async (course) => {
  const activity = await getCourseActivity(course._id);
  return {
    ...decorateCourse(course),
    activity
  };
};

export const getCourses = async (req, res, next) => {
  try {
    const { status, department, assignee, priority, search } = req.query;
    const filters = {};

    if (status && status !== 'All') {
      filters.status = status;
    }

    if (department && department !== 'All') {
      filters.department = department;
    }

    if (assignee && assignee !== 'All') {
      filters['assignee.name'] = assignee;
    }

    if (priority && priority !== 'All') {
      filters.priority = priority;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [{ title: regex }, { code: regex }];
    }

    const courses = await Course.find(filters).populate('assets').sort({ dueDate: 1, createdAt: -1 });
    res.json(courses.map((course) => decorateCourse(course)));
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('assets');

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    res.json(await buildDetailedCourseResponse(course));
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const course = new Course(req.body);
    syncPublishedAt(course, course.status);
    await applyWorkflowAutomation(course, null);
    await course.save();

    await recordActivity({
      action: 'created',
      course,
      user: course.assignee.name
    });

    const populatedCourse = await Course.findById(course._id).populate('assets');
    res.status(201).json(await buildDetailedCourseResponse(populatedCourse));
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    const previousStatus = course.status;

    Object.entries(req.body).forEach(([key, value]) => {
      course[key] = value;
    });

    syncPublishedAt(course, course.status);
    await applyWorkflowAutomation(course, previousStatus);
    await course.save();

    if (previousStatus !== course.status) {
      await recordActivity({
        action: `moved to ${course.status}`,
        course,
        user: course.assignee.name
      });
    }

    if (req.body.blockers || req.body.accessibility || Object.hasOwn(req.body, 'notes')) {
      await recordActivity({
        action: 'saved course operations',
        course,
        user: course.assignee.name
      });
    }

    const populatedCourse = await Course.findById(course._id).populate('assets');
    res.json(await buildDetailedCourseResponse(populatedCourse));
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    await Asset.updateMany({ _id: { $in: course.assets } }, { $pull: { linkedCourses: course._id } });
    await recordActivity({
      action: 'archived',
      course,
      user: course.assignee.name
    });

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const course = await Course.findById(req.params.id).populate('assets');

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    const previousStatus = course.status;
    course.status = status;
    syncPublishedAt(course, status);
    await applyWorkflowAutomation(course, previousStatus);
    await course.save();

    await recordActivity({
      action: `moved to ${status}`,
      course,
      user: course.assignee.name
    });

    res.json(await buildDetailedCourseResponse(course));
  } catch (error) {
    next(error);
  }
};
