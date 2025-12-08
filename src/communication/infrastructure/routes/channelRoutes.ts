import { Router } from 'express';
import * as ChannelController from '../controllers/channel.controller';
import * as MemberController from '../controllers/channel-member.controller';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Channels
router.post('/', ChannelController.createChannel);
router.get('/', ChannelController.listChannels);

// Members
router.post('/:channelId/members', MemberController.addMember);
router.get('/:channelId/members', MemberController.listMembers);

export default router;
