import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { Activity } from './models/Activity.js';
import assetRoutes from './routes/assetRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uploadsDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/courses', courseRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);
app.get('/api/activity', async (_req, res, next) => {
  try {
    const activity = await Activity.find().sort({ timestamp: -1 }).limit(20);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: error.message || 'Something went wrong while processing the request.'
  });
});

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to server/.env before starting the API.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`CourseOps API listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
