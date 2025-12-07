import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const favoriteController = new FavoriteController();

router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.post('/:projectId/favorite', favoriteController.toggleFavorite);

export default router;
