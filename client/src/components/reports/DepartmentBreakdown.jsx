import PropTypes from 'prop-types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const chartColors = {
  Draft: '#A78BFA',
  'In Development': '#4F8CFF',
  'In Review': '#FBBF24',
  Published: '#34D399'
};

export const DepartmentBreakdown = ({ data }) => (
  <div className="h-[320px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
        <CartesianGrid stroke="#2A2E3F" horizontal={false} />
        <XAxis type="number" stroke="#8B8FA3" axisLine={false} tickLine={false} />
        <YAxis dataKey="department" type="category" stroke="#8B8FA3" axisLine={false} tickLine={false} width={120} />
        <Tooltip contentStyle={{ background: '#161922', border: '1px solid #2A2E3F', borderRadius: 8 }} />
        {Object.entries(chartColors).map(([key, color]) => (
          <Bar key={key} dataKey={key} stackId="department" fill={color} radius={[4, 4, 4, 4]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

DepartmentBreakdown.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};

