import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { CourseCard } from './CourseCard';

export const KanbanColumn = ({ status, dotColor, count, courses, onAddCourse, onOpenCourse }) => (
  <div className="panel flex min-w-[290px] flex-col p-4">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <h3 className="text-[16px] font-semibold text-copy">{status}</h3>
        <span className="rounded-control border border-border px-2 py-0.5 text-[12px] text-copyMuted">{count}</span>
      </div>
      <button
        type="button"
        onClick={() => onAddCourse(status)}
        className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-copyMuted transition hover:bg-panelAlt hover:text-copy"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex min-h-[240px] flex-1 flex-col gap-3 rounded-card transition ${snapshot.isDraggingOver ? 'bg-brand/5' : ''}`}
        >
          {courses.map((course, index) => (
            <Draggable key={course._id} draggableId={course._id} index={index}>
              {(draggableProvided) => (
                <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps}>
                  <CourseCard course={course} onClick={onOpenCourse} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

KanbanColumn.propTypes = {
  status: PropTypes.string.isRequired,
  dotColor: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddCourse: PropTypes.func.isRequired,
  onOpenCourse: PropTypes.func.isRequired
};
