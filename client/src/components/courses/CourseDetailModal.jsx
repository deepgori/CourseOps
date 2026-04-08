import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CalendarDays,
  CheckCheck,
  CircleAlert,
  Link2,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate, formatRelativeTime, resolveAssetUrl } from '../../utils/formatters';

const toneMap = {
  Draft: 'draft',
  'In Development': 'brand',
  'In Review': 'warning',
  Published: 'success'
};

const riskToneMap = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger'
};

export const CourseDetailModal = ({
  isOpen,
  course,
  assets,
  onClose,
  onEdit,
  onDelete,
  onSaveOperations,
  onStatusChange,
  onLinkAsset
}) => {
  const [notes, setNotes] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [accessibility, setAccessibility] = useState({
    captions: 0,
    altText: 0,
    documents: 0,
    checklist: 0
  });
  const [blockers, setBlockers] = useState([]);
  const [newBlocker, setNewBlocker] = useState('');
  const [newSeverity, setNewSeverity] = useState('Medium');

  useEffect(() => {
    if (course) {
      setNotes(course.notes || '');
      setAccessibility({
        captions: course.accessibility?.captions ?? 0,
        altText: course.accessibility?.altText ?? 0,
        documents: course.accessibility?.documents ?? 0,
        checklist: course.accessibility?.checklist ?? 0
      });
      setBlockers(course.blockers || []);
    }
  }, [course]);

  const availableAssets = useMemo(
    () =>
      assets.filter((asset) => !course?.assets?.some((linkedAsset) => linkedAsset._id === asset._id)),
    [assets, course]
  );

  if (!isOpen || !course) {
    return null;
  }

  const handleLinkAsset = async () => {
    if (!selectedAssetId) {
      return;
    }

    await onLinkAsset(selectedAssetId);
    setSelectedAssetId('');
  };

  const updateAccessibilityMetric = (key, value) => {
    const nextValue = Math.max(0, Math.min(100, Number(value)));
    setAccessibility((current) => ({ ...current, [key]: nextValue }));
  };

  const addBlocker = () => {
    if (!newBlocker.trim()) {
      return;
    }

    setBlockers((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: newBlocker.trim(),
        severity: newSeverity,
        resolved: false
      }
    ]);
    setNewBlocker('');
    setNewSeverity('Medium');
  };

  const toggleBlocker = (blockerId) => {
    setBlockers((current) =>
      current.map((blocker) =>
        (blocker.id || blocker._id) === blockerId ? { ...blocker, resolved: !blocker.resolved } : blocker
      )
    );
  };

  const removeBlocker = (blockerId) => {
    setBlockers((current) => current.filter((blocker) => (blocker.id || blocker._id) !== blockerId));
  };

  const handleSave = async () => {
    await onSaveOperations({
      notes,
      blockers,
      accessibility: {
        ...accessibility,
        flaggedIssues: course.accessibility?.flaggedIssues || [],
        lastAuditedAt: new Date().toISOString()
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-sm">
      <div className="panel-elevated max-h-[92vh] w-full max-w-6xl overflow-y-auto animate-scale-in p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-small">{course.code}</p>
            <h3 className="mt-2 text-[22px] font-semibold text-copy">{course.title}</h3>
            <p className="mt-2 max-w-3xl text-copyMuted">{course.description}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onEdit} className="button-secondary">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="button-secondary text-danger">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
            <button type="button" onClick={onClose} className="button-secondary">
              Close
            </button>
          </div>
        </div>

        {course.automation?.reviewAutoAssigned && course.status === 'In Review' ? (
          <div className="mb-6 flex items-center gap-3 rounded-card border border-brand/15 bg-brand/10 px-4 py-3 text-brand">
            <Sparkles className="h-4 w-4" />
            <span className="text-[13px] font-medium">
              Workflow automation routed this course to QA review with {course.assignee.name}.
            </span>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="Department" value={course.department} />
              <InfoTile label="Priority" value={course.priority} />
              <InfoTile label="Assignee" value={`${course.assignee.name} - ${course.assignee.role}`} />
              <InfoTile label="Created" value={formatDate(course.createdAt)} />
              <InfoTile label="Due Date" value={formatDate(course.dueDate)} />
              <InfoTile label="Health Score" value={`${course.metrics.healthScore}/100`} accent={riskToneMap[course.metrics.riskLevel]} />
              <InfoTile label="Accessibility" value={`${course.metrics.accessibilityProgress}%`} accent="brand" />
              <div className="rounded-card border border-border bg-panelAlt/50 p-4">
                <p className="label-small">Status</p>
                <select
                  value={course.status}
                  onChange={(event) => onStatusChange(event.target.value)}
                  className="input-base mt-3 w-full"
                >
                  {Object.keys(toneMap).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="rounded-card border border-border bg-panelAlt/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="label-small">Accessibility Tracker</p>
                  <h4 className="mt-2 text-[16px] font-semibold text-copy">Production readiness checklist</h4>
                </div>
                <Badge tone={riskToneMap[course.metrics.riskLevel]}>{course.metrics.riskLevel} risk</Badge>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ['captions', 'Captions'],
                  ['altText', 'Alt Text'],
                  ['documents', 'Document Remediation'],
                  ['checklist', 'Launch Checklist']
                ].map(([key, label]) => (
                  <AccessibilitySlider
                    key={key}
                    label={label}
                    value={accessibility[key]}
                    onChange={(value) => updateAccessibilityMetric(key, value)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-card border border-border bg-panelAlt/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="label-small">Operational Blockers</p>
                  <h4 className="mt-2 text-[16px] font-semibold text-copy">
                    {blockers.filter((blocker) => !blocker.resolved).length} open issues
                  </h4>
                </div>
                <Badge tone={blockers.some((blocker) => !blocker.resolved) ? 'warning' : 'success'}>
                  {blockers.some((blocker) => !blocker.resolved) ? 'Action needed' : 'Clear path'}
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {blockers.length ? (
                  blockers.map((blocker) => (
                    <div
                      key={blocker.id || blocker._id}
                      className={`flex items-center justify-between gap-3 rounded-card border px-4 py-3 ${
                        blocker.resolved ? 'border-success/20 bg-success/10' : 'border-border bg-white/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleBlocker(blocker.id || blocker._id)}
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                            blocker.resolved ? 'border-success bg-success text-white' : 'border-border bg-white'
                          }`}
                        >
                          {blocker.resolved ? <CheckCheck className="h-3 w-3" /> : null}
                        </button>
                        <div>
                          <p className={`font-medium ${blocker.resolved ? 'text-copyMuted line-through' : 'text-copy'}`}>
                            {blocker.label}
                          </p>
                          <p className="mt-1 text-[12px] text-copyMuted">{blocker.severity} priority blocker</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBlocker(blocker.id || blocker._id)}
                        className="text-[12px] font-medium text-copyMuted transition hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-copyMuted">No blockers are currently recorded for this course.</p>
                )}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
                <input
                  value={newBlocker}
                  onChange={(event) => setNewBlocker(event.target.value)}
                  className="input-base w-full"
                  placeholder="Add a blocker or dependency"
                />
                <select
                  value={newSeverity}
                  onChange={(event) => setNewSeverity(event.target.value)}
                  className="input-base w-full"
                >
                  {['Low', 'Medium', 'High'].map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addBlocker} className="button-primary">
                  Add Blocker
                </button>
              </div>
            </section>

            <section className="rounded-card border border-border bg-panelAlt/50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-small">Linked Assets</p>
                  <h4 className="mt-2 text-[16px] font-semibold text-copy">
                    {course.assets?.length || 0} attached materials
                  </h4>
                </div>
                <Badge tone={toneMap[course.status]}>{course.status}</Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {course.assets?.length ? (
                  course.assets.map((asset) => <AssetChip key={asset._id} asset={asset} />)
                ) : (
                  <p className="text-copyMuted">No assets are linked to this course yet.</p>
                )}
              </div>
              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <select
                  value={selectedAssetId}
                  onChange={(event) => setSelectedAssetId(event.target.value)}
                  className="input-base flex-1"
                >
                  <option value="">Attach an existing asset</option>
                  {availableAssets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.originalName}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleLinkAsset} className="button-primary">
                  <Link2 className="mr-2 h-4 w-4" />
                  Link Asset
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-card border border-border bg-panelAlt/50 p-5">
              <p className="label-small">Notes & Comments</p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows="11"
                className="mt-4 w-full rounded-control border border-border bg-surface px-3 py-3 text-copy placeholder:text-copySoft"
                placeholder="Capture review notes, handoff context, faculty requests, or launch reminders."
              />
              <button type="button" onClick={handleSave} className="button-primary mt-4">
                Save Operations
              </button>
              <div className="mt-6 space-y-3 rounded-card border border-border bg-surface p-4">
                <p className="label-small">Production Snapshot</p>
                <div className="flex items-center gap-3 text-copyMuted">
                  <CalendarDays className="h-4 w-4" />
                  <span>Due {formatDate(course.dueDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-copyMuted">
                  <Paperclip className="h-4 w-4" />
                  <span>{course.assets?.length || 0} linked assets</span>
                </div>
                <div className="flex items-center gap-3 text-copyMuted">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{course.metrics.accessibilityProgress}% accessibility readiness</span>
                </div>
                <div className="flex items-center gap-3 text-copyMuted">
                  <CircleAlert className="h-4 w-4" />
                  <span>{course.metrics.recommendation}</span>
                </div>
              </div>
            </section>

            <section className="rounded-card border border-border bg-panelAlt/50 p-5">
              <p className="label-small">Recent Activity</p>
              <div className="mt-4 space-y-4">
                {course.activity?.length ? (
                  course.activity.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                      <div>
                        <p className="text-[13px] text-copy">
                          <span className="font-semibold">{item.user}</span> {item.action}
                        </p>
                        <p className="mt-1 text-[12px] text-copyMuted">{formatRelativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-copyMuted">No recent activity has been logged for this course yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const accentMap = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  brand: 'text-brand'
};

const InfoTile = ({ label, value, accent }) => (
  <div className="rounded-card border border-border bg-panelAlt/50 p-4">
    <p className="label-small">{label}</p>
    <p className={`mt-3 font-semibold ${accent ? accentMap[accent] : 'text-copy'}`}>{value}</p>
  </div>
);

const AccessibilitySlider = ({ label, value, onChange }) => (
  <div className="rounded-card border border-border bg-white/70 p-4">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[13px] font-medium text-copy">{label}</p>
      <span className="text-[12px] font-semibold text-copyMuted">{value}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full accent-brand"
    />
  </div>
);

const AssetChip = ({ asset }) => (
  <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
    {asset.type === 'image' ? (
      <img src={resolveAssetUrl(asset.url)} alt={asset.originalName} className="h-12 w-12 rounded-card object-cover" />
    ) : asset.type === 'video' ? (
      <video src={resolveAssetUrl(asset.url)} className="h-12 w-12 rounded-card object-cover" muted />
    ) : (
      <div className="flex h-12 w-12 items-center justify-center rounded-card bg-panelAlt text-[12px] font-semibold text-copyMuted">
        {asset.extension}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate font-medium text-copy">{asset.originalName}</p>
      <p className="text-[12px] text-copyMuted">{asset.extension}</p>
    </div>
  </div>
);

InfoTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  accent: PropTypes.oneOf(['success', 'warning', 'danger', 'brand'])
};

AccessibilitySlider.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

AssetChip.propTypes = {
  asset: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    originalName: PropTypes.string.isRequired,
    extension: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }).isRequired
};

CourseDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  course: PropTypes.object,
  assets: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSaveOperations: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onLinkAsset: PropTypes.func.isRequired
};
