import PropTypes from 'prop-types';

export const ChartCard = ({ label, title, children, action }) => (
  <div className="panel animate-fade-in p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="label-small">{label}</p>
        <h3 className="mt-2 text-[16px] font-semibold text-copy">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

ChartCard.propTypes = {
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  action: PropTypes.node
};

