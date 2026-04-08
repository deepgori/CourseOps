import express from 'express';
import {
  exportReport,
  getActivityReport,
  getCompletionReport,
  getDepartmentReport,
  getOverviewReport
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/overview', getOverviewReport);
router.get('/completion', getCompletionReport);
router.get('/departments', getDepartmentReport);
router.get('/activity', getActivityReport);
router.get('/export', exportReport);

export default router;

