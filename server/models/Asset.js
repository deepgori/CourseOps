import mongoose from 'mongoose';

const { Schema } = mongoose;

export const ASSET_TYPES = ['video', 'image', 'document', 'audio'];

const assetSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    type: { type: String, enum: ASSET_TYPES, required: true },
    extension: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    path: { type: String, default: '' },
    metadata: {
      duration: { type: String, default: 'Not available' },
      resolution: { type: String, default: 'Not available' }
    },
    linkedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
  },
  { timestamps: true }
);

export const Asset = mongoose.model('Asset', assetSchema);

