import mongoose from 'mongoose';

const { Schema } = mongoose;

export const COURSE_STATUSES = ['Draft', 'In Development', 'In Review', 'Published'];
export const COURSE_PRIORITIES = ['Low', 'Medium', 'High'];
export const COURSE_DEPARTMENTS = [
  'Biology',
  'Computer Science',
  'Nursing',
  'Business',
  'Psychology',
  'Engineering'
];

const assigneeSchema = new Schema(
  {
    name: { type: String, required: true },
    initials: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    avatarColor: { type: String, required: true }
  },
  { _id: false }
);

const blockerSchema = new Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    label: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    resolved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const accessibilitySchema = new Schema(
  {
    captions: { type: Number, default: 0, min: 0, max: 100 },
    altText: { type: Number, default: 0, min: 0, max: 100 },
    documents: { type: Number, default: 0, min: 0, max: 100 },
    checklist: { type: Number, default: 0, min: 0, max: 100 },
    flaggedIssues: [{ type: String, trim: true }],
    lastAuditedAt: { type: Date, default: null }
  },
  { _id: false }
);

const automationSchema = new Schema(
  {
    reviewAutoAssigned: { type: Boolean, default: false },
    lastAutoAssignedAt: { type: Date, default: null }
  },
  { _id: false }
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    department: {
      type: String,
      enum: COURSE_DEPARTMENTS,
      required: true
    },
    status: {
      type: String,
      enum: COURSE_STATUSES,
      default: 'Draft'
    },
    priority: {
      type: String,
      enum: COURSE_PRIORITIES,
      default: 'Medium'
    },
    assignee: { type: assigneeSchema, required: true },
    dueDate: { type: Date, required: true },
    publishedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    assets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    blockers: { type: [blockerSchema], default: [] },
    accessibility: {
      type: accessibilitySchema,
      default: () => ({
        captions: 0,
        altText: 0,
        documents: 0,
        checklist: 0,
        flaggedIssues: [],
        lastAuditedAt: null
      })
    },
    automation: {
      type: automationSchema,
      default: () => ({
        reviewAutoAssigned: false,
        lastAutoAssignedAt: null
      })
    }
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
