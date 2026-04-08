import PropTypes from 'prop-types';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const CourseCompletionChart = ({ data }) => (
  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="courseCompletionFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2A2E3F" vertical={false} />
        <XAxis dataKey="label" stroke="#8B8FA3" tickLine={false} axisLine={false} />
        <YAxis stroke="#8B8FA3" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#161922', border: '1px solid #2A2E3F', borderRadius: 8 }} />
        <Area type="monotone" dataKey="total" stroke="#4F8CFF" strokeWidth={2} fill="url(#courseCompletionFill)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

CourseCompletionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired
    })
  ).isRequired
};

