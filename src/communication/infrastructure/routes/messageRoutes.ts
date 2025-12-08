import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { SharedFileController } from '../controllers/shared-file.controller';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';
import { upload } from '../../../shared/infrastructure/middlewares/upload.middleware';

const router = Router();
const messageController = new MessageController();
const fileController = new SharedFileController();

// All routes require authentication
router.use(authMiddleware);

// Message routes
router.get('/channels/:channelId/messages', messageController.getMessages);
router.post('/channels/:channelId/messages', messageController.sendMessage);
router.put('/messages/:messageId', messageController.updateMessage);
router.delete('/messages/:messageId', messageController.deleteMessage);

// Shared files routes
router.get('/channels/:channelId/files', fileController.getFiles);
router.post('/channels/:channelId/files', upload.single('file'), fileController.uploadFile);
router.delete('/files/:fileId', fileController.deleteFile);

export default router;
