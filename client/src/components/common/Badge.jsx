import PropTypes from 'prop-types';

const toneMap = {
  default: 'border-border bg-panelAlt text-copyMuted',
  brand: 'border-brand/20 bg-brand/10 text-brand',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-danger/20 bg-danger/10 text-danger',
  draft: 'border-draft/20 bg-draft/10 text-draft'
};

export const Badge = ({ children, tone = 'default' }) => (
  <span className={`inline-flex items-center rounded-control border px-2 py-1 text-[12px] font-medium ${toneMap[tone]}`}>
    {children}
  </span>
);

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['default', 'brand', 'success', 'warning', 'danger', 'draft'])
};

