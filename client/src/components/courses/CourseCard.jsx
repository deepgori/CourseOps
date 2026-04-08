import PropTypes from 'prop-types';
import { CalendarDays, Paperclip } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate, getDueDateState } from '../../utils/formatters';

const toneMap = {
  Draft: 'draft',
  'In Development': 'brand',
  'In Review': 'warning',
  Published: 'success'
};

const priorityBorderMap = {
  Low: 'border-l-brand',
  Medium: 'border-l-warning',
  High: 'border-l-danger'
};

const riskToneMap = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger'
};

export const CourseCard = ({ course, onClick }) => {
  const dueState = getDueDateState(course.dueDate, course.status);

  return (
    <button
      type="button"
      onClick={() => onClick(course)}
      className={`w-full rounded-card border border-border bg-panelAlt p-4 text-left transition hover:border-brand/30 hover:bg-elevated ${priorityBorderMap[course.priority]} border-l-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-copy">{course.code}</p>
          <h4 className="mt-1 text-[15px] font-semibold text-copy">{course.title}</h4>
        </div>
        <Badge tone={toneMap[course.status]}>{course.status}</Badge>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Badge>{course.department}</Badge>
        {course.metrics ? <Badge tone={riskToneMap[course.metrics.riskLevel]}>{course.metrics.healthScore} health</Badge> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
            style={{ backgroundColor: course.assignee.avatarColor }}
          >
            {course.assignee.initials}
          </div>
          <div>
            <p className="text-[13px] font-medium text-copy">{course.assignee.name}</p>
            <p className="text-[12px] text-copyMuted">{course.assignee.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-copyMuted">
          <Paperclip className="h-4 w-4" />
          <span>{course.assets?.length || 0}</span>
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-2 text-[12px] ${dueState === 'overdue' ? 'text-danger' : 'text-copyMuted'}`}>
        <CalendarDays className="h-4 w-4" />
        <span>{formatDate(course.dueDate)}</span>
      </div>
      {course.metrics?.unresolvedBlockerCount ? (
        <p className="mt-2 text-[12px] text-warning">
          {course.metrics.unresolvedBlockerCount} blocker{course.metrics.unresolvedBlockerCount > 1 ? 's' : ''} still open
        </p>
      ) : null}
    </button>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      name: PropTypes.string.isRequired,
      initials: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      avatarColor: PropTypes.string.isRequired
    }).isRequired,
    assets: PropTypes.array,
    metrics: PropTypes.shape({
      healthScore: PropTypes.number,
      riskLevel: PropTypes.string,
      unresolvedBlockerCount: PropTypes.number
    })
  }).isRequired,
  onClick: PropTypes.func.isRequired
};
