import { Router } from 'express';
import peopleController from '../controllers/PeopleController';
import friendsController from '../controllers/FriendsController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/people
router.get('/', peopleController.list);

// POST /api/people/invite
router.post('/invite', peopleController.invite);

// Friends endpoints
router.get('/friends', friendsController.list);
router.post('/friends', friendsController.create);

export default router;
