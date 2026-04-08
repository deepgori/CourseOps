import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatFileSize, resolveAssetUrl } from '../../utils/formatters';

export const VideoPreview = ({ asset, onClose }) => {
  const [metadata, setMetadata] = useState({
    duration: asset?.metadata?.duration || 'Not available',
    resolution: asset?.metadata?.resolution || 'Not available'
  });

  if (!asset) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-sm">
      <div className="panel-elevated w-full max-w-4xl animate-scale-in p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="label-small">Video Preview</p>
            <h3 className="mt-2 text-[18px] font-semibold text-copy">{asset.originalName}</h3>
          </div>
          <button type="button" onClick={onClose} className="button-secondary">
            Close
          </button>
        </div>
        <video
          src={resolveAssetUrl(asset.url)}
          controls
          className="max-h-[60vh] w-full rounded-card bg-black"
          onLoadedMetadata={(event) => {
            const { duration, videoWidth, videoHeight } = event.currentTarget;
            setMetadata({
              duration: `${Math.floor(duration / 60)
                .toString()
                .padStart(2, '0')}:${Math.round(duration % 60)
                .toString()
                .padStart(2, '0')}`,
              resolution: `${videoWidth}x${videoHeight}`
            });
          }}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Meta label="Duration" value={metadata.duration} />
          <Meta label="Resolution" value={metadata.resolution} />
          <Meta label="File Size" value={formatFileSize(asset.size)} />
          <Meta label="Upload Date" value={formatDate(asset.createdAt)} />
        </div>
      </div>
    </div>
  );
};

const Meta = ({ label, value }) => (
  <div className="rounded-card border border-border bg-panelAlt p-4">
    <p className="label-small">{label}</p>
    <p className="mt-3 text-copy">{value}</p>
  </div>
);

Meta.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

VideoPreview.propTypes = {
  asset: PropTypes.object,
  onClose: PropTypes.func.isRequired
};

