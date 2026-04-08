import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ChartCard } from './ChartCard';
import { CourseCompletionChart } from './CourseCompletionChart';
import { DepartmentBreakdown } from './DepartmentBreakdown';
import { ExportButton } from './ExportButton';
import { EmptyState } from '../common/EmptyState';
import { SkeletonBlock } from '../common/SkeletonBlock';
import { useReports } from '../../hooks/useReports';
import { useAppContext } from '../../context/AppContext';
import { reportRanges } from '../../utils/constants';

const statusColors = ['#A78BFA', '#4F8CFF', '#FBBF24', '#34D399'];

const sliceByRange = (data, range) => {
  if (range === 'This Month') {
    return data.slice(-1);
  }

  if (range === 'This Quarter') {
    return data.slice(-3);
  }

  return data;
};

export const ReportsPage = () => {
  const { showToast } = useAppContext();
  const { overview, completion, departments, loading, error, refetch, exportCsv } = useReports();
  const [range, setRange] = useState('This Quarter');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const completionData = useMemo(() => sliceByRange(completion, range), [completion, range]);
  const assetTrendData = useMemo(() => {
    if (!overview?.assetUploadTrend) {
      return [];
    }

    if (range === 'This Month') {
      return overview.assetUploadTrend.slice(-4);
    }

    if (range === 'This Quarter') {
      return overview.assetUploadTrend.slice(-12);
    }

    return overview.assetUploadTrend;
  }, [overview, range]);

  const handleExport = async () => {
    try {
      const blob = await exportCsv();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'courseops-report.csv';
      anchor.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', title: 'CSV exported', message: 'Department summary has been downloaded.' });
    } catch (exportError) {
      showToast({ type: 'error', title: 'Export failed', message: exportError.message });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-[92px]" />
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[360px]" />
          ))}
        </div>
        <SkeletonBlock className="h-[340px]" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Reporting data is unavailable"
        description={error || 'The analytics dashboard could not be loaded.'}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel animate-fade-in p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {reportRanges.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`h-10 rounded-control border px-4 text-[13px] font-semibold transition ${range === option ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-panelAlt text-copyMuted hover:text-copy'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {range === 'Custom' ? (
            <div className="flex flex-wrap gap-3">
              <input type="date" value={customRange.start} onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))} className="input-base" />
              <input type="date" value={customRange.end} onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))} className="input-base" />
            </div>
          ) : null}
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard label="Course Completion Over Time" title="Completed launches by month">
          <CourseCompletionChart data={completionData} />
        </ChartCard>

        <ChartCard label="Status Distribution" title="Current course mix">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.statusDistribution}
                  dataKey="total"
                  nameKey="status"
                  innerRadius={82}
                  outerRadius={112}
                  paddingAngle={2}
                >
                  {overview.statusDistribution.map((entry, index) => (
                    <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#161922', border: '1px solid #2A2E3F', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none -mt-[168px] flex justify-center">
              <div className="text-center">
                <p className="label-small">Total</p>
                <p className="mt-2 text-[28px] font-semibold text-copy">{overview.stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard label="Department Breakdown" title="Courses by department and status">
          <DepartmentBreakdown data={departments.breakdown} />
        </ChartCard>

        <ChartCard label="Asset Upload Trend" title="Uploads by week">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={assetTrendData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#8B8FA3" axisLine={false} tickLine={false} />
                <YAxis stroke="#8B8FA3" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161922', border: '1px solid #2A2E3F', borderRadius: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#34D399" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="panel animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="label-small">Department Summary</p>
            <h3 className="mt-2 text-[16px] font-semibold text-copy">Completion and workload overview</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-panelAlt">
              <tr>
                {[
                  'Department',
                  'Total Courses',
                  'Completed',
                  'In Progress',
                  'Overdue',
                  'Completion Rate (%)',
                  'Avg Health',
                  'Accessibility'
                ].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-copyMuted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.summary.map((row) => (
                <tr key={row.department} className={`border-t border-border ${row.completionRate < 50 ? 'bg-danger/5' : ''}`}>
                  <td className="px-6 py-4 font-semibold text-copy">{row.department}</td>
                  <td className="px-6 py-4 text-copyMuted">{row.totalCourses}</td>
                  <td className="px-6 py-4 text-copyMuted">{row.completed}</td>
                  <td className="px-6 py-4 text-copyMuted">{row.inProgress}</td>
                  <td className="px-6 py-4 text-copyMuted">{row.overdue}</td>
                  <td className={`px-6 py-4 font-medium ${row.completionRate < 50 ? 'text-danger' : 'text-copyMuted'}`}>
                    {row.completionRate}%
                  </td>
                  <td className="px-6 py-4 text-copyMuted">{row.averageHealth}</td>
                  <td className="px-6 py-4 text-copyMuted">{row.averageAccessibility}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
