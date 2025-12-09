import { Router } from 'express';
import { CallRoomController } from '../controllers/call-room.controller';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const callController = new CallRoomController();

// All routes require authentication
router.use(authMiddleware);

// Call room routes
router.post('/rooms', callController.createRoom);
router.get('/rooms/team/:teamId', callController.getActiveRoom);
router.post('/rooms/:roomId/join', callController.joinRoom);
router.post('/rooms/:roomId/leave', callController.leaveRoom);
router.patch('/rooms/:roomId/state', callController.updateParticipantState);

export default router;
