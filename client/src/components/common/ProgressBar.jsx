import PropTypes from 'prop-types';

export const ProgressBar = ({ value }) => (
  <div className="h-2 w-full rounded-full bg-panelAlt">
    <div
      className="h-full rounded-full bg-brand transition-all duration-150 ease-in-out"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired
};

