import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { LayoutGrid, List, Plus, RefreshCcw, Workflow } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CourseDetailModal } from './CourseDetailModal';
import { CourseForm } from './CourseForm';
import { CourseListView } from './CourseListView';
import { KanbanColumn } from './KanbanColumn';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SkeletonBlock } from '../common/SkeletonBlock';
import { useAssets } from '../../hooks/useAssets';
import { useCourses } from '../../hooks/useCourses';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useAppContext } from '../../context/AppContext';
import { departmentOptions, statusOptions, teamMembers } from '../../utils/constants';

export const KanbanBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAppContext();
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    department: 'All',
    assignee: searchParams.get('assignee') || 'All',
    priority: 'All'
  });
  const deferredSearch = useDeferredValue(filters.search);
  const courseFilters = useMemo(() => ({ ...filters, search: deferredSearch }), [deferredSearch, filters]);
  const { courses, loading, error, refetch, getCourse, createCourse, updateCourse, deleteCourse, updateCourseStatus } =
    useCourses(courseFilters);
  const { assets, linkAsset } = useAssets({ search: '', type: 'All', sort: 'newest' });
  const [viewMode, setViewMode] = useState('kanban');
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(false);
  const [formState, setFormState] = useState({ isOpen: false, course: null, defaultStatus: 'Draft' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const assignee = searchParams.get('assignee') || 'All';
    setFilters((current) => ({ ...current, assignee }));
  }, [searchParams]);

  useEffect(() => {
    if (location.state?.openNew) {
      setFormState({ isOpen: true, course: null, defaultStatus: 'Draft' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Courses unavailable',
        message: error,
        onRetry: refetch
      });
    }
  }, [error, refetch, showToast]);

  const sortedCourses = useMemo(() => {
    const items = [...courses];

    items.sort((left, right) => {
      const leftValue =
        sortConfig.key === 'assignee'
          ? left.assignee.name
          : sortConfig.key === 'health'
            ? left.metrics?.healthScore || 0
          : sortConfig.key === 'assets'
            ? left.assets.length
            : left[sortConfig.key];
      const rightValue =
        sortConfig.key === 'assignee'
          ? right.assignee.name
          : sortConfig.key === 'health'
            ? right.metrics?.healthScore || 0
          : sortConfig.key === 'assets'
            ? right.assets.length
            : right[sortConfig.key];

      if (leftValue < rightValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return items;
  }, [courses, sortConfig]);

  const coursesByStatus = useMemo(
    () =>
      statusOptions.map((status) => ({
        ...status,
        courses: courses.filter((course) => course.status === status.label)
      })),
    [courses]
  );

  const openCourseDetail = async (course) => {
    try {
      setLoadingCourseDetail(true);
      const detailedCourse = await getCourse(course._id);
      setSelectedCourse(detailedCourse);
    } catch (detailError) {
      showToast({ type: 'error', title: 'Course unavailable', message: detailError.message });
    } finally {
      setLoadingCourseDetail(false);
    }
  };

  const handleSubmitCourse = async (payload) => {
    try {
      if (formState.course) {
        const updated = await updateCourse(formState.course._id, payload);
        setSelectedCourse(updated);
        showToast({ type: 'success', title: 'Course updated', message: `${updated.code} is up to date.` });
      } else {
        const created = await createCourse(payload);
        showToast({ type: 'success', title: 'Course created', message: `${created.code} is now in the tracker.` });
      }

      setFormState({ isOpen: false, course: null, defaultStatus: 'Draft' });
    } catch (submitError) {
      showToast({ type: 'error', title: 'Unable to save course', message: submitError.message });
    }
  };

  const handleStatusChange = async (courseId, status) => {
    try {
      const updated = await updateCourseStatus(courseId, status);
      if (selectedCourse?._id === updated._id) {
        setSelectedCourse(updated);
      }
      showToast({
        type: 'success',
        title: 'Status updated',
        message:
          status === 'In Review' && updated.assignee.role === 'QA Reviewer'
            ? `${updated.code} moved to In Review and auto-routed to ${updated.assignee.name}.`
            : `${updated.code} moved to ${status}.`
      });
    } catch (statusError) {
      showToast({ type: 'error', title: 'Unable to move course', message: statusError.message });
    }
  };

  const handleSaveOperations = async (payload) => {
    if (!selectedCourse) {
      return;
    }

    try {
      const updated = await updateCourse(selectedCourse._id, payload);
      setSelectedCourse(updated);
      showToast({ type: 'success', title: 'Operations updated', message: 'Accessibility, blockers, and notes were saved.' });
    } catch (operationsError) {
      showToast({ type: 'error', title: 'Unable to save operations', message: operationsError.message });
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) {
      return;
    }

    try {
      await deleteCourse(selectedCourse._id);
      showToast({ type: 'success', title: 'Course deleted', message: 'The course was removed from the tracker.' });
      setSelectedCourse(null);
      setDeleteConfirmOpen(false);
    } catch (deleteError) {
      showToast({ type: 'error', title: 'Unable to delete course', message: deleteError.message });
    }
  };

  const handleLinkAsset = async (assetId) => {
    if (!selectedCourse) {
      return;
    }

    try {
      await linkAsset(assetId, selectedCourse._id);
      const refreshed = await getCourse(selectedCourse._id);
      setSelectedCourse(refreshed);
      showToast({ type: 'success', title: 'Asset linked', message: 'The asset is now attached to the course.' });
    } catch (linkError) {
      showToast({ type: 'error', title: 'Unable to link asset', message: linkError.message });
    }
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const { handleDragEnd } = useDragAndDrop({
    onStatusChange: handleStatusChange
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="panel p-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))_auto]">
            <SkeletonBlock className="h-10" />
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10" />
            ))}
            <SkeletonBlock className="h-10" />
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[420px] min-w-[290px] flex-1" />
          ))}
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <>
        <div className="mb-6 panel p-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))_auto_auto]">
            <SearchBar value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} placeholder="Search courses by title or code" />
            <FilterSelect label="Status" value={filters.status} options={['All', ...statusOptions.map((status) => status.label)]} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} />
            <FilterSelect label="Department" value={filters.department} options={['All', ...departmentOptions]} onChange={(value) => setFilters((current) => ({ ...current, department: value }))} />
            <FilterSelect label="Assignee" value={filters.assignee} options={['All', ...teamMembers.map((member) => member.name)]} onChange={(value) => setFilters((current) => ({ ...current, assignee: value }))} />
            <FilterSelect label="Priority" value={filters.priority} options={['All', 'Low', 'Medium', 'High']} onChange={(value) => setFilters((current) => ({ ...current, priority: value }))} />
            <div className="flex items-center gap-2">
              <ViewToggleButton active={viewMode === 'kanban'} onClick={() => setViewMode('kanban')} icon={LayoutGrid} />
              <ViewToggleButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
            </div>
            <button type="button" onClick={() => setFormState({ isOpen: true, course: null, defaultStatus: 'Draft' })} className="button-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </button>
          </div>
        </div>
        <EmptyState
          icon={Workflow}
          title="No courses match these filters"
          description="Adjust the filters or add a new course to start tracking production work."
          actionLabel="Create Course"
          onAction={() => setFormState({ isOpen: true, course: null, defaultStatus: 'Draft' })}
        />
        <CourseForm
          isOpen={formState.isOpen}
          course={formState.course}
          defaultStatus={formState.defaultStatus}
          onClose={() => setFormState({ isOpen: false, course: null, defaultStatus: 'Draft' })}
          onSubmit={handleSubmitCourse}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="panel animate-fade-in p-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))_auto_auto]">
            <SearchBar value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} placeholder="Search courses by title or code" />
            <FilterSelect label="Status" value={filters.status} options={['All', ...statusOptions.map((status) => status.label)]} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} />
            <FilterSelect label="Department" value={filters.department} options={['All', ...departmentOptions]} onChange={(value) => setFilters((current) => ({ ...current, department: value }))} />
            <FilterSelect label="Assignee" value={filters.assignee} options={['All', ...teamMembers.map((member) => member.name)]} onChange={(value) => setFilters((current) => ({ ...current, assignee: value }))} />
            <FilterSelect label="Priority" value={filters.priority} options={['All', 'Low', 'Medium', 'High']} onChange={(value) => setFilters((current) => ({ ...current, priority: value }))} />
            <div className="flex items-end gap-2">
              <ViewToggleButton active={viewMode === 'kanban'} onClick={() => setViewMode('kanban')} icon={LayoutGrid} />
              <ViewToggleButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
              <button type="button" onClick={refetch} className="button-secondary">
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={() => setFormState({ isOpen: true, course: null, defaultStatus: 'Draft' })} className="button-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </button>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {coursesByStatus.map((column) => (
                <KanbanColumn
                  key={column.label}
                  status={column.label}
                  dotColor={column.dotColor}
                  count={column.courses.length}
                  courses={column.courses}
                  onAddCourse={(status) => setFormState({ isOpen: true, course: null, defaultStatus: status })}
                  onOpenCourse={openCourseDetail}
                />
              ))}
            </div>
          </DragDropContext>
        ) : (
          <CourseListView courses={sortedCourses} sortConfig={sortConfig} onSort={handleSort} onOpenCourse={openCourseDetail} />
        )}
      </div>

      <CourseForm
        isOpen={formState.isOpen}
        course={formState.course}
        defaultStatus={formState.defaultStatus}
        onClose={() => setFormState({ isOpen: false, course: null, defaultStatus: 'Draft' })}
        onSubmit={handleSubmitCourse}
      />

      <CourseDetailModal
        isOpen={Boolean(selectedCourse)}
        course={selectedCourse}
        assets={assets}
        onClose={() => setSelectedCourse(null)}
        onEdit={() => {
          setFormState({ isOpen: true, course: selectedCourse, defaultStatus: selectedCourse.status });
          setSelectedCourse(null);
        }}
        onDelete={() => setDeleteConfirmOpen(true)}
        onSaveOperations={handleSaveOperations}
        onStatusChange={(status) => handleStatusChange(selectedCourse._id, status)}
        onLinkAsset={handleLinkAsset}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete this course?"
        description="This will remove the course from the tracker and unlink its attached assets."
        confirmLabel="Delete Course"
        onConfirm={handleDeleteCourse}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {loadingCourseDetail ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-surface/60 backdrop-blur-sm">
          <div className="panel-elevated w-[320px] p-6">
            <p className="label-small">Loading</p>
            <SkeletonBlock className="mt-4 h-6 w-40" />
            <SkeletonBlock className="mt-4 h-24 w-full" />
          </div>
        </div>
      ) : null}
    </>
  );
};

const FilterSelect = ({ label, value, options, onChange }) => (
  <label className="grid gap-2">
    <span className="label-small">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="input-base w-full">
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const ViewToggleButton = ({ active, onClick, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-10 w-10 items-center justify-center rounded-control border transition ${active ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-panelAlt text-copyMuted hover:text-copy'}`}
  >
    <Icon className="h-4 w-4" />
  </button>
);
