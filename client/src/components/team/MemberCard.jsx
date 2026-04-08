import PropTypes from 'prop-types';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { Badge } from '../common/Badge';

const toneMap = {
  Available: 'success',
  Balanced: 'brand',
  Stretched: 'warning',
  Overloaded: 'danger'
};

export const MemberCard = ({ member, courseCount, workloadScore, utilization, atRiskCount, overdueCount, capacityLabel, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(member)}
    className="panel flex flex-col gap-5 p-5 text-left transition hover:border-brand/30 hover:bg-panelAlt/40 animate-fade-in"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-semibold text-white"
          style={{ backgroundColor: member.avatarColor }}
        >
          {member.initials}
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-copy">{member.name}</h3>
          <p className="mt-1 text-copyMuted">{member.role}</p>
        </div>
      </div>
      <Badge tone={toneMap[capacityLabel]}>{capacityLabel}</Badge>
    </div>

    <div>
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium uppercase tracking-[0.16em] text-copyMuted">
        <span>Capacity</span>
        <span>{utilization}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-panelAlt">
        <div
          className={`h-full rounded-full ${
            utilization >= 100 ? 'bg-danger' : utilization >= 70 ? 'bg-warning' : 'bg-brand'
          }`}
          style={{ width: `${Math.min(utilization, 100)}%` }}
        />
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label="Assigned" value={`${courseCount} courses`} />
      <Metric label="Load Score" value={`${workloadScore} pts`} />
      <Metric label="At Risk" value={`${atRiskCount} flagged`} />
    </div>

    {overdueCount ? (
      <div className="flex items-center gap-2 rounded-card border border-danger/20 bg-danger/10 px-3 py-3 text-[13px] text-danger">
        <AlertTriangle className="h-4 w-4" />
        <span>{overdueCount} overdue milestone{overdueCount > 1 ? 's' : ''} assigned</span>
      </div>
    ) : null}

    <div className="space-y-3 text-[13px] text-copyMuted">
      <div className="flex items-center gap-3">
        <Mail className="h-4 w-4" />
        <span>{member.email}</span>
      </div>
      <div className="flex items-center gap-3">
        <Phone className="h-4 w-4" />
        <span>{member.phone}</span>
      </div>
    </div>
  </button>
);

const Metric = ({ label, value }) => (
  <div className="rounded-card border border-border bg-white/70 px-3 py-3">
    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-copyMuted">{label}</p>
    <p className="mt-2 text-[14px] font-semibold text-copy">{value}</p>
  </div>
);

Metric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

MemberCard.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    avatarColor: PropTypes.string.isRequired
  }).isRequired,
  courseCount: PropTypes.number.isRequired,
  workloadScore: PropTypes.number.isRequired,
  utilization: PropTypes.number.isRequired,
  atRiskCount: PropTypes.number.isRequired,
  overdueCount: PropTypes.number.isRequired,
  capacityLabel: PropTypes.oneOf(['Available', 'Balanced', 'Stretched', 'Overloaded']).isRequired,
  onSelect: PropTypes.func.isRequired
};
