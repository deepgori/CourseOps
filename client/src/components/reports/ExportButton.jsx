import PropTypes from 'prop-types';
import { Download } from 'lucide-react';

export const ExportButton = ({ onExport }) => (
  <button type="button" onClick={onExport} className="button-primary">
    <Download className="mr-2 h-4 w-4" />
    Export as CSV
  </button>
);

ExportButton.propTypes = {
  onExport: PropTypes.func.isRequired
};

