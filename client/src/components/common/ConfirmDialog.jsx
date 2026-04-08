import PropTypes from 'prop-types';

export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-sm">
      <div className="panel-elevated w-full max-w-md animate-scale-in p-6">
        <div className="space-y-2">
          <h3 className="text-[18px] font-semibold text-copy">{title}</h3>
          <p className="text-copyMuted">{description}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="button-secondary">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="button-primary bg-danger hover:bg-danger/90">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

