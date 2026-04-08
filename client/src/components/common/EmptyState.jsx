import PropTypes from 'prop-types';

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="panel flex min-h-[240px] flex-col items-center justify-center gap-4 px-8 py-12 text-center animate-fade-in">
    <div className="flex h-16 w-16 items-center justify-center rounded-card border border-border bg-panelAlt">
      <Icon className="h-8 w-8 text-copyMuted" />
    </div>
    <div className="space-y-2">
      <h3 className="text-[18px] font-semibold text-copy">{title}</h3>
      <p className="max-w-md text-copyMuted">{description}</p>
    </div>
    {actionLabel && onAction ? (
      <button type="button" onClick={onAction} className="button-primary">
        {actionLabel}
      </button>
    ) : null}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

