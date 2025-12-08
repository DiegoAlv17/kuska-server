import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class PresenceController {
  // Actualizar presencia del usuario
  updatePresence = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { status, isTyping, channelId } = req.body as { 
        status?: 'conectado' | 'ausente' | 'desconectado'; 
        isTyping?: boolean;
        channelId?: string | null;
      };

      // Upsert presence record
      const presence = await prisma.presence.upsert({
        where: { userId },
        create: {
          userId,
          status: status || 'conectado',
          isTyping: isTyping || false,
          channelId: channelId || null,
          lastActivity: new Date(),
          updatedAt: new Date()
        },
        update: {
          ...(status && { status }),
          ...(isTyping !== undefined && { isTyping }),
          ...(channelId !== undefined && { channelId }),
          lastActivity: new Date(),
          updatedAt: new Date()
        }
      });

      res.status(200).json({ success: true, data: { presence } });
    } catch (err) {
      console.error('[PresenceController.updatePresence] error', err);
      res.status(500).json({ success: false, message: 'Error updating presence' });
    }
  };

  // Obtener presencia de usuarios específicos
  getPresence = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { userIds } = req.query;
      const ids = typeof userIds === 'string' ? userIds.split(',') : [];

      if (ids.length === 0) {
        res.status(400).json({ success: false, message: 'userIds parameter required' });
        return;
      }

      // Get presence for requested users
      const presences = await prisma.presence.findMany({
        where: { userId: { in: ids } }
      });

      // Check for stale presences (more than 5 minutes since last activity = offline)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const mapped = presences.map(p => ({
        userId: p.userId,
        status: new Date(p.lastActivity) < fiveMinutesAgo ? 'desconectado' : p.status,
        isTyping: p.isTyping,
        lastActivity: p.lastActivity
      }));

      // Add missing users as offline
      const presentUserIds = presences.map(p => p.userId);
      const missingIds = ids.filter(id => !presentUserIds.includes(id));
      missingIds.forEach(id => {
        mapped.push({ userId: id, status: 'desconectado', isTyping: false, lastActivity: new Date(0) });
      });

      res.status(200).json({ success: true, data: { presences: mapped } });
    } catch (err) {
      console.error('[PresenceController.getPresence] error', err);
      res.status(500).json({ success: false, message: 'Error fetching presence' });
    }
  };

  // Heartbeat: actualizar lastActivity
  heartbeat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      await prisma.presence.upsert({
        where: { userId },
        create: {
          userId,
          status: 'conectado',
          lastActivity: new Date(),
          updatedAt: new Date()
        },
        update: {
          lastActivity: new Date(),
          updatedAt: new Date()
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[PresenceController.heartbeat] error', err);
      res.status(500).json({ success: false, message: 'Error updating heartbeat' });
    }
  };
}
