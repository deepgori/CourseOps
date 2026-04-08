import PropTypes from 'prop-types';

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-card bg-panelAlt ${className}`} />
);

SkeletonBlock.propTypes = {
  className: PropTypes.string
};

