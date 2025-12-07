import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/activities/today', dashboardController.getTodayActivities);

export default router;
