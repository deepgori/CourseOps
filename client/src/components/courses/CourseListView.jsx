import PropTypes from 'prop-types';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate, getDueDateState } from '../../utils/formatters';

const toneMap = {
  Draft: 'draft',
  'In Development': 'brand',
  'In Review': 'warning',
  Published: 'success'
};

export const CourseListView = ({ courses, sortConfig, onSort, onOpenCourse }) => {
  const headers = [
    ['code', 'Course Code'],
    ['title', 'Title'],
    ['department', 'Department'],
    ['status', 'Status'],
    ['assignee', 'Assignee'],
    ['dueDate', 'Due Date'],
    ['priority', 'Priority'],
    ['health', 'Health'],
    ['assets', 'Assets']
  ];

  return (
    <div className="panel animate-fade-in overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-panelAlt">
            <tr>
              {headers.map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-left">
                  <button type="button" onClick={() => onSort(key)} className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-copyMuted">
                    {label}
                    {sortConfig.key === key ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course._id}
                className="cursor-pointer border-t border-border transition hover:bg-panelAlt/80"
                onClick={() => onOpenCourse(course)}
              >
                <td className="px-4 py-4 font-semibold text-copy">{course.code}</td>
                <td className="px-4 py-4 text-copy">{course.title}</td>
                <td className="px-4 py-4 text-copyMuted">{course.department}</td>
                <td className="px-4 py-4">
                  <Badge tone={toneMap[course.status]}>{course.status}</Badge>
                </td>
                <td className="px-4 py-4 text-copyMuted">{course.assignee.name}</td>
                <td className={`px-4 py-4 ${getDueDateState(course.dueDate, course.status) === 'overdue' ? 'text-danger' : 'text-copyMuted'}`}>
                  {formatDate(course.dueDate)}
                </td>
                <td className="px-4 py-4 text-copyMuted">{course.priority}</td>
                <td className="px-4 py-4 text-copyMuted">{course.metrics?.healthScore || '-'} / 100</td>
                <td className="px-4 py-4 text-copyMuted">{course.assets?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

CourseListView.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['asc', 'desc']).isRequired
  }).isRequired,
  onSort: PropTypes.func.isRequired,
  onOpenCourse: PropTypes.func.isRequired
};
