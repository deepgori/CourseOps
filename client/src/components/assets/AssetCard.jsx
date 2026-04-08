import { useState } from 'react';
import PropTypes from 'prop-types';
import { Download, Eye, Link2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate, formatFileSize, resolveAssetUrl } from '../../utils/formatters';

const toneMap = {
  video: 'brand',
  image: 'success',
  document: 'warning',
  audio: 'draft'
};

export const AssetCard = ({ asset, onPreview, onLink, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const downloadAsset = () => {
    window.open(resolveAssetUrl(asset.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="panel animate-fade-in overflow-hidden">
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-control border border-border bg-surface/80 text-copyMuted backdrop-blur-sm transition hover:text-copy"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen ? (
          <div className="absolute right-3 top-12 z-20 w-40 rounded-card border border-border bg-elevated p-2 shadow-none">
            <MenuButton label="Preview" icon={Eye} onClick={() => { setMenuOpen(false); onPreview(asset); }} />
            <MenuButton label="Download" icon={Download} onClick={() => { setMenuOpen(false); downloadAsset(); }} />
            <MenuButton label="Link to Course" icon={Link2} onClick={() => { setMenuOpen(false); onLink(asset); }} />
            <MenuButton label="Delete" icon={Trash2} onClick={() => { setMenuOpen(false); onDelete(asset); }} danger />
          </div>
        ) : null}

        {asset.type === 'image' ? (
          <img src={resolveAssetUrl(asset.url)} alt={asset.originalName} className="h-44 w-full object-cover" />
        ) : asset.type === 'video' ? (
          <video src={resolveAssetUrl(asset.url)} className="h-44 w-full object-cover" muted />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-panelAlt">
            <div className="rounded-card border border-border bg-surface px-4 py-3 text-[13px] font-semibold text-copyMuted">
              {asset.extension}
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-copy">{asset.originalName}</p>
            <p className="mt-1 text-[13px] text-copyMuted">{formatDate(asset.createdAt)}</p>
          </div>
          <Badge tone={toneMap[asset.type]}>{asset.extension}</Badge>
        </div>
        <div className="mt-4 flex items-center justify-between text-[13px] text-copyMuted">
          <span>{formatFileSize(asset.size)}</span>
          <span>{asset.linkedCourses?.length || 0} linked</span>
        </div>
      </div>
    </div>
  );
};

const MenuButton = ({ label, icon: Icon, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-[13px] transition ${danger ? 'text-danger hover:bg-danger/10' : 'text-copyMuted hover:bg-panelAlt hover:text-copy'}`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

MenuButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  danger: PropTypes.bool
};

AssetCard.propTypes = {
  asset: PropTypes.object.isRequired,
  onPreview: PropTypes.func.isRequired,
  onLink: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

