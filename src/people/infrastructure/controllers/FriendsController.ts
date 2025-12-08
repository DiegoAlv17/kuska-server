import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

class FriendsController {
  // GET /api/people/friends
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const friends = await (prisma as any).friendship.findMany({
        where: { userId },
        include: { friend: { select: { id: true, completeName: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const items = friends.map(f => ({ id: f.friend.id, name: f.friend.completeName || f.friend.email, email: f.friend.email, avatar: f.friend.avatar }));

      res.json({ success: true, data: { items } });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/people/friends
  // body: { friendId: string }
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { friendId } = req.body as { friendId?: string };

      console.log('[FriendsController.create] incoming', { userId, friendId });

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      if (!friendId) {
        res.status(400).json({ success: false, message: 'friendId is required' });
        return;
      }

      if (friendId === userId) {
        res.status(400).json({ success: false, message: 'Cannot add yourself' });
        return;
      }

      // Check if friend user exists
      const friendUser = await prisma.user.findUnique({ where: { id: friendId } });
      console.log('[FriendsController.create] friendUser lookup result', { friendUserId: friendUser?.id });
      if (!friendUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Avoid unique constraint errors by checking first
      const existing = await (prisma as any).friendship.findFirst({ where: { userId, friendId } });
      console.log('[FriendsController.create] existing friendship', { existing });
      if (existing) {
        // Return a consistent payload when already friends
        console.log('[FriendsController.create] already friends -> returning created:false');
        res.status(200).json({ success: true, data: { created: false, message: 'Already friends' } });
        return;
      }

      const created = await (prisma as any).friendship.create({ data: { userId, friendId } });
      console.log('[FriendsController.create] created friendship', { createdId: created?.id });
      res.status(201).json({ success: true, data: { created: true, id: created.id, friend: { id: friendUser.id, name: friendUser.completeName, email: friendUser.email, avatar: friendUser.avatar } } });
    } catch (err) {
      console.error('[FriendsController.create] error', err);
      next(err);
    }
  };
}

export default new FriendsController();
