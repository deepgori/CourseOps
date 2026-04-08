import fs from 'node:fs';
import path from 'node:path';
import { Activity } from '../models/Activity.js';
import { Asset } from '../models/Asset.js';
import { Course } from '../models/Course.js';
import { getCourseTarget } from '../utils/courseInsights.js';

const detectAssetType = (extension) => {
  const normalized = extension.toLowerCase();

  if (['.mp4', '.mov'].includes(normalized)) {
    return 'video';
  }

  if (['.png', '.jpg', '.jpeg'].includes(normalized)) {
    return 'image';
  }

  if (['.mp3', '.wav'].includes(normalized)) {
    return 'audio';
  }

  return 'document';
};

const recordActivity = async ({ action, target, user, targetId = null, targetType = 'asset' }) => {
  await Activity.create({ action, target, targetId, targetType, user, timestamp: new Date() });
};

export const getAssets = async (req, res, next) => {
  try {
    const { type, search, sort = 'newest' } = req.query;
    const filters = {};

    if (type && type !== 'All') {
      filters.type = type.toLowerCase();
    }

    if (search) {
      filters.fileName = new RegExp(search, 'i');
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { fileName: 1 },
      largest: { size: -1 }
    };

    const assets = await Asset.find(filters)
      .populate('linkedCourses', 'code title')
      .sort(sortMap[sort] || sortMap.newest);

    res.json(assets);
  } catch (error) {
    next(error);
  }
};

export const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file was uploaded.' });
      return;
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const type = detectAssetType(extension);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const asset = await Asset.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      type,
      extension: extension.replace('.', '').toUpperCase(),
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `${baseUrl}/uploads/${req.file.filename}`,
      path: req.file.path
    });

    if (req.body.courseId) {
      const course = await Course.findById(req.body.courseId);

      if (course) {
        course.assets.addToSet(asset._id);
        await course.save();
        asset.linkedCourses.addToSet(course._id);
        await asset.save();

        await recordActivity({
          action: 'received uploaded asset',
          target: getCourseTarget(course),
          targetId: course._id,
          targetType: 'course',
          user: 'Media Operations'
        });
      }
    }

    await recordActivity({
      action: 'uploaded asset',
      target: req.file.originalname,
      user: 'Media Operations'
    });

    const populatedAsset = await Asset.findById(asset._id).populate('linkedCourses', 'code title');
    res.status(201).json(populatedAsset);
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('linkedCourses', 'code title');

    if (!asset) {
      res.status(404).json({ message: 'Asset not found.' });
      return;
    }

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      res.status(404).json({ message: 'Asset not found.' });
      return;
    }

    await Course.updateMany({ _id: { $in: asset.linkedCourses } }, { $pull: { assets: asset._id } });

    if (asset.path && fs.existsSync(asset.path)) {
      fs.unlinkSync(asset.path);
    }

    await recordActivity({
      action: 'deleted asset',
      target: asset.originalName,
      user: 'Media Operations'
    });

    await asset.deleteOne();
    res.json({ message: 'Asset deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const linkAssetToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const asset = await Asset.findById(req.params.id);
    const course = await Course.findById(courseId);

    if (!asset || !course) {
      res.status(404).json({ message: 'Course or asset not found.' });
      return;
    }

    asset.linkedCourses.addToSet(course._id);
    course.assets.addToSet(asset._id);
    await Promise.all([asset.save(), course.save()]);

    await recordActivity({
      action: 'linked asset',
      target: `${asset.originalName} to ${course.code}`,
      targetId: course._id,
      targetType: 'course',
      user: 'Media Operations'
    });

    await recordActivity({
      action: 'received linked asset',
      target: getCourseTarget(course),
      targetId: course._id,
      targetType: 'course',
      user: 'Media Operations'
    });

    const populatedAsset = await Asset.findById(asset._id).populate('linkedCourses', 'code title');
    res.json(populatedAsset);
  } catch (error) {
    next(error);
  }
};
