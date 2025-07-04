import { Router } from 'express';
import { getAnalyticsController } from '../controllers/analyticsController';

const router = Router();

// GET /api/analytics
router.get('/', getAnalyticsController);

export default router; 