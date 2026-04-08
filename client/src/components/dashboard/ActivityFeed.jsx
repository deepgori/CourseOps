import PropTypes from 'prop-types';
import { formatRelativeTime } from '../../utils/formatters';

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const ActivityFeed = ({ items }) => (
  <div className="panel animate-fade-in p-6">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="label-small">Recent Activity</p>
        <h3 className="mt-2 text-[16px] font-semibold text-copy">Latest team updates</h3>
      </div>
      <span className="text-[13px] text-copyMuted">{items.length} logged actions</span>
    </div>
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panelAlt text-[12px] font-semibold text-copy">
            {getInitials(item.user)}
          </div>
          <div className="flex-1 border-l border-border pl-4">
            <p className="text-copy">
              <span className="font-semibold">{item.user}</span> {item.action} <span className="text-copyMuted">{item.target}</span>
            </p>
            <p className="mt-1 text-[13px] text-copyMuted">{formatRelativeTime(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

ActivityFeed.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ).isRequired
};

