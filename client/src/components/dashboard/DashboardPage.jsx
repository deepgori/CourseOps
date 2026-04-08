import {
  AlertTriangle,
  CheckCircle2,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Workflow
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { StatsCard } from './StatsCard';
import { useReports } from '../../hooks/useReports';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonBlock } from '../common/SkeletonBlock';

const statusColorMap = {
  Draft: '#B692F6',
  'In Development': '#4F7BEB',
  'In Review': '#D99A4A',
  Published: '#2FA97A'
};

const riskToneMap = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger'
};

export const DashboardPage = () => {
  const { overview, activity, loading, error, refetch } = useReports();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[144px]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <SkeletonBlock className="h-[320px]" />
          <SkeletonBlock className="h-[320px]" />
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <EmptyState
        icon={Workflow}
        title="Dashboard data is unavailable"
        description={error || 'The dashboard could not load. Try the request again.'}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  const cards = [
    {
      label: 'Total Courses',
      value: overview.stats.totalCourses,
      subtitle: `${overview.stats.activeCourses} active`
    },
    {
      label: 'In Production',
      value: overview.stats.inProduction,
      subtitle: `${overview.stats.inProductionPercent}% of total`,
      progress: overview.stats.inProductionPercent
    },
    {
      label: 'Accessibility Avg',
      value: `${overview.stats.accessibilityAverage}%`,
      subtitle: 'Average readiness across active production'
    },
    {
      label: 'At Risk',
      value: overview.stats.atRiskCourses,
      subtitle: `${overview.stats.overdue} overdue milestones`,
      accent: overview.stats.atRiskCourses ? 'text-danger' : 'text-copy'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
        {cards.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="panel animate-fade-in p-6">
          <div className="mb-6">
            <p className="label-small">Course Pipeline</p>
            <h3 className="mt-2 text-[16px] font-semibold text-copy">Production stage distribution</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  overview.pipeline.reduce(
                    (accumulator, item) => ({ ...accumulator, [item.status]: item.total }),
                    {}
                  )
                ]}
                layout="vertical"
                margin={{ top: 10, right: 8, bottom: 10, left: 16 }}
              >
                <CartesianGrid horizontal={false} stroke="#DCCFBD" />
                <XAxis type="number" stroke="#8E8376" />
                <YAxis type="category" dataKey={() => 'Courses'} stroke="#8E8376" width={70} />
                <Tooltip
                  cursor={{ fill: '#F4EBDD' }}
                  contentStyle={{ background: '#FFFCF7', border: '1px solid #E5D9C8', borderRadius: 8 }}
                />
                {overview.pipeline.map((item) => (
                  <Bar
                    key={item.status}
                    dataKey={item.status}
                    stackId="pipeline"
                    fill={statusColorMap[item.status]}
                    radius={[4, 4, 4, 4]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {overview.pipeline.map((item) => (
              <div key={item.status} className="rounded-card border border-border bg-panelAlt/50 px-3 py-2">
                <p className="text-[12px] text-copyMuted">{item.status}</p>
                <p className="mt-1 text-[18px] font-semibold text-copy">{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        <QuickActions />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <ActivityFeed items={activity} />
        <div className="space-y-6">
          <div className="panel animate-fade-in p-6">
            <p className="label-small">Signal Summary</p>
            <div className="mt-5 grid gap-4">
              <SignalRow icon={Layers3} label="Open production work" value={`${overview.stats.inProduction} courses`} />
              <SignalRow icon={ShieldCheck} label="Accessibility average" value={`${overview.stats.accessibilityAverage}% readiness`} />
              <SignalRow icon={PackageCheck} label="Automated review routing" value={`${overview.stats.automatedReviews} courses routed to QA`} />
              <SignalRow icon={AlertTriangle} label="Overdue queue" value={`${overview.stats.overdue} flagged milestones`} danger={overview.stats.overdue > 0} />
            </div>
          </div>

          <div className="panel animate-fade-in p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="label-small">Risk Watchlist</p>
                <h3 className="mt-2 text-[16px] font-semibold text-copy">Courses needing intervention</h3>
              </div>
              <Badge tone={overview.stats.atRiskCourses ? 'warning' : 'success'}>
                {overview.stats.atRiskCourses} high risk
              </Badge>
            </div>
            <div className="space-y-4">
              {overview.atRiskSnapshot.map((course) => (
                <div key={course._id} className="rounded-card border border-border bg-panelAlt/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-copy">{course.code}</p>
                      <p className="mt-1 text-[14px] text-copy">{course.title}</p>
                      <p className="mt-1 text-[12px] text-copyMuted">Owner: {course.assignee}</p>
                    </div>
                    <Badge tone={riskToneMap[course.riskLevel]}>{course.healthScore}</Badge>
                  </div>
                  <p className="mt-3 text-[12px] text-copyMuted">{course.recommendation}</p>
                </div>
              ))}
            </div>
            {!overview.atRiskSnapshot.length ? (
              <div className="mt-4 flex items-center gap-3 rounded-card border border-success/20 bg-success/10 px-4 py-3 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[13px] font-medium">No high-risk courses are currently flagged.</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const SignalRow = ({ icon: Icon, label, value, danger = false }) => (
  <div className="flex items-center gap-4 rounded-card border border-border bg-panelAlt/50 px-4 py-4">
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-card ${
        danger ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-[13px] text-copyMuted">{label}</p>
      <p className="mt-1 font-semibold text-copy">{value}</p>
    </div>
  </div>
);
