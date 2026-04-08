import { BarChart3, BookPlus, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'New Course', icon: BookPlus, path: '/courses', state: { openNew: true } },
  { label: 'Upload Asset', icon: UploadCloud, path: '/assets', state: { highlightUploader: true } },
  { label: 'Generate Report', icon: BarChart3, path: '/reports' }
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="panel animate-fade-in p-6">
      <p className="label-small">Quick Actions</p>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.path, { state: action.state })}
            className="flex h-11 items-center justify-between rounded-card border border-border bg-panelAlt px-4 text-left transition hover:border-brand/30 hover:bg-brand/10"
          >
            <div className="flex items-center gap-3">
              <action.icon className="h-4 w-4 text-brand" />
              <span className="font-semibold text-copy">{action.label}</span>
            </div>
            <span className="text-[12px] text-copyMuted">Open</span>
          </button>
        ))}
      </div>
    </div>
  );
};

