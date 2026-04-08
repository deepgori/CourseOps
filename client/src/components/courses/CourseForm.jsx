import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { departmentOptions, statusOptions, teamMembers } from '../../utils/constants';

const initialForm = {
  title: '',
  code: '',
  description: '',
  department: departmentOptions[0],
  assignee: teamMembers[0].name,
  priority: 'Medium',
  dueDate: '',
  status: 'Draft'
};

export const CourseForm = ({ isOpen, course, defaultStatus = 'Draft', onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(course);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (course) {
      setForm({
        title: course.title,
        code: course.code,
        description: course.description,
        department: course.department,
        assignee: course.assignee.name,
        priority: course.priority,
        dueDate: course.dueDate.slice(0, 10),
        status: course.status
      });
    } else {
      setForm({ ...initialForm, status: defaultStatus });
    }

    setErrors({});
  }, [course, defaultStatus, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (!form.code.trim()) {
      nextErrors.code = 'Course code is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const assignee = teamMembers.find((member) => member.name === form.assignee) || teamMembers[0];

    await onSubmit({
      title: form.title.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      department: form.department,
      assignee,
      priority: form.priority,
      dueDate: form.dueDate,
      status: form.status
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-sm">
      <div className="panel-elevated max-h-[92vh] w-full max-w-2xl overflow-y-auto animate-scale-in p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="label-small">{isEditing ? 'Edit Course' : 'New Course'}</p>
            <h3 className="mt-2 text-[18px] font-semibold text-copy">
              {isEditing ? 'Update course details' : 'Add a new production item'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="button-secondary">
            Close
          </button>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Title" error={errors.title}>
            <input className="input-base w-full" value={form.title} onChange={(event) => handleChange('title', event.target.value)} placeholder="Marine Ecosystem Analysis" />
          </Field>
          <Field label="Course Code" error={errors.code}>
            <input className="input-base w-full" value={form.code} onChange={(event) => handleChange('code', event.target.value)} placeholder="BIO 201" />
          </Field>
          <Field label="Department">
            <select className="input-base w-full" value={form.department} onChange={(event) => handleChange('department', event.target.value)}>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select className="input-base w-full" value={form.assignee} onChange={(event) => handleChange('assignee', event.target.value)}>
              {teamMembers.map((member) => (
                <option key={member.email} value={member.name}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due Date">
            <input type="date" className="input-base w-full" value={form.dueDate} onChange={(event) => handleChange('dueDate', event.target.value)} />
          </Field>
          <Field label="Status">
            <select className="input-base w-full" value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
              {statusOptions.map((status) => (
                <option key={status.label} value={status.label}>
                  {status.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <span className="label-small">Priority</span>
            <div className="mt-3 flex flex-wrap gap-3">
              {['Low', 'Medium', 'High'].map((priority) => (
                <label key={priority} className={`flex cursor-pointer items-center gap-2 rounded-control border px-4 py-2 ${form.priority === priority ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-panelAlt text-copyMuted'}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={form.priority === priority}
                    onChange={(event) => handleChange('priority', event.target.value)}
                    className="sr-only"
                  />
                  {priority}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows="5"
                className="w-full rounded-control border border-border bg-panelAlt px-3 py-3 text-copy placeholder:text-copySoft transition"
                placeholder="Describe what the team is producing, revising, or reviewing."
              />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              {isEditing ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, children, error }) => (
  <label className="grid gap-2">
    <span className="label-small">{label}</span>
    {children}
    {error ? <span className="text-[12px] text-danger">{error}</span> : null}
  </label>
);

Field.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  error: PropTypes.string
};

CourseForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  course: PropTypes.object,
  defaultStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};
