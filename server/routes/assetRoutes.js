import express from 'express';
import {
  deleteAsset,
  getAssetById,
  getAssets,
  linkAssetToCourse,
  uploadAsset
} from '../controllers/assetController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAssets);
router.post('/upload', upload.single('file'), uploadAsset);
router.get('/:id', getAssetById);
router.delete('/:id', deleteAsset);
router.patch('/:id/link', linkAssetToCourse);

export default router;

