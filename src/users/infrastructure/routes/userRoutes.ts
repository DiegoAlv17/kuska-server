import { Router } from 'express';
import { UserProfileController } from '../controllers/UserProfileController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const userProfileController = new UserProfileController();

router.use(authMiddleware);

router.get('/profile', userProfileController.getProfile);
router.get('/profile/:id', userProfileController.getProfileById);
router.patch('/profile', userProfileController.updateProfile);

export default router;
