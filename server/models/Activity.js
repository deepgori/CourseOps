import mongoose from 'mongoose';

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    action: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    targetType: { type: String, default: 'course', trim: true },
    user: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Activity = mongoose.model('Activity', activitySchema);
