import { useEffect, useMemo, useState } from 'react';
import { Files } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AssetCard } from './AssetCard';
import { AssetFilterBar } from './AssetFilterBar';
import { AssetUploader } from './AssetUploader';
import { VideoPreview } from './VideoPreview';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { SkeletonBlock } from '../common/SkeletonBlock';
import { useAssets } from '../../hooks/useAssets';
import { useCourses } from '../../hooks/useCourses';
import { useAppContext } from '../../context/AppContext';

export const AssetLibrary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [filters, setFilters] = useState({ search: '', type: 'All', sort: 'newest' });
  const { assets, loading, error, refetch, uploadAsset, deleteAsset, linkAsset } = useAssets(filters);
  const { courses } = useCourses({ search: '', status: 'All', department: 'All', assignee: 'All', priority: 'All' });
  const [previewAsset, setPreviewAsset] = useState(null);
  const [linkingAsset, setLinkingAsset] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [deletingAsset, setDeletingAsset] = useState(null);

  useEffect(() => {
    if (location.state?.highlightUploader) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Assets unavailable',
        message: error,
        onRetry: refetch
      });
    }
  }, [error, refetch, showToast]);

  const hasAssets = useMemo(() => assets.length > 0, [assets]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadAsset(formData);
      showToast({ type: 'success', title: 'Asset uploaded', message: `${file.name} is now available in the library.` });
    } catch (uploadError) {
      showToast({ type: 'error', title: 'Upload failed', message: uploadError.message });
      throw uploadError;
    }
  };

  const handleDelete = async () => {
    if (!deletingAsset) {
      return;
    }

    try {
      await deleteAsset(deletingAsset._id);
      showToast({ type: 'success', title: 'Asset deleted', message: `${deletingAsset.originalName} was removed.` });
      setDeletingAsset(null);
    } catch (deleteError) {
      showToast({ type: 'error', title: 'Delete failed', message: deleteError.message });
    }
  };

  const handleLinkToCourse = async () => {
    if (!linkingAsset || !selectedCourseId) {
      return;
    }

    try {
      await linkAsset(linkingAsset._id, selectedCourseId);
      showToast({ type: 'success', title: 'Asset linked', message: `${linkingAsset.originalName} was linked to a course.` });
      setLinkingAsset(null);
      setSelectedCourseId('');
    } catch (linkError) {
      showToast({ type: 'error', title: 'Link failed', message: linkError.message });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AssetUploader onUpload={handleUpload} />
        <AssetFilterBar
          search={filters.search}
          onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          activeType={filters.type}
          onTypeChange={(value) => setFilters((current) => ({ ...current, type: value }))}
          sort={filters.sort}
          onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-[310px]" />
            ))}
          </div>
        ) : hasAssets ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset._id}
                asset={asset}
                onPreview={(item) => {
                  if (item.type === 'video') {
                    setPreviewAsset(item);
                  } else {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                onLink={(item) => setLinkingAsset(item)}
                onDelete={(item) => setDeletingAsset(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Files}
            title="No assets match this filter set"
            description="Try a broader search or upload new materials to build your shared course library."
            actionLabel="Upload Asset"
            onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        )}
      </div>

      <VideoPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />

      <ConfirmDialog
        isOpen={Boolean(deletingAsset)}
        title="Delete this asset?"
        description="This removes the file reference and unlinks it from connected courses."
        confirmLabel="Delete Asset"
        onConfirm={handleDelete}
        onClose={() => setDeletingAsset(null)}
      />

      {linkingAsset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-sm">
          <div className="panel-elevated w-full max-w-lg animate-scale-in p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-small">Link Asset</p>
                <h3 className="mt-2 text-[18px] font-semibold text-copy">{linkingAsset.originalName}</h3>
              </div>
              <button type="button" onClick={() => setLinkingAsset(null)} className="button-secondary">
                Close
              </button>
            </div>
            <label className="mt-6 grid gap-2">
              <span className="label-small">Select Course</span>
              <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="input-base">
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setLinkingAsset(null)} className="button-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleLinkToCourse} className="button-primary">
                Link to Course
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
