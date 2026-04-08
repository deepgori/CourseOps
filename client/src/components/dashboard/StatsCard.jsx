import PropTypes from 'prop-types';
import { ProgressBar } from '../common/ProgressBar';

export const StatsCard = ({ label, value, subtitle, accent = 'text-copy', progress }) => (
  <div className="panel animate-fade-in p-5">
    <p className="label-small">{label}</p>
    <div className="mt-4 flex items-end justify-between gap-3">
      <h2 className={`text-[30px] font-semibold ${accent}`}>{value}</h2>
      <p className="text-[13px] text-copyMuted">{subtitle}</p>
    </div>
    {typeof progress === 'number' ? (
      <div className="mt-4">
        <ProgressBar value={progress} />
      </div>
    ) : null}
  </div>
);

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  accent: PropTypes.string,
  progress: PropTypes.number
};

