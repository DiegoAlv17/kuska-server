import { Request, Response } from 'express';
import { ChannelPrismaRepository } from '../repositories/channel-prisma.repository';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

const repo = new ChannelPrismaRepository();

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, type, description, projectId, teamId, isPrivate } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required and must be a string' });
    if (!type || typeof type !== 'string') return res.status(400).json({ error: 'type is required and must be a string' });

    const created = await repo.create({ name, description, type, projectId, teamId, isPrivate });
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const listChannels = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { teamId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // If teamId provided, get channels for that team where user is member
    if (teamId) {
      const channels = await prisma.channel.findMany({
        where: {
          teamId: String(teamId),
          members: { some: { userId } }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  completeName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              content: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapped = channels.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.type,
        isPrivate: c.isPrivate,
        memberCount: c.members?.length || 0,
        lastMessage: c.messages[0]?.content || '',
        lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
        createdAt: c.createdAt
      }));

      return res.json({ success: true, data: { channels: mapped } });
    }

    // Otherwise, pagination fallback
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const perPage = Math.min(100, Math.max(1, parseInt(String(req.query.perPage || '20'), 10)));
    const skip = (page - 1) * perPage;

    const [rows, total] = await Promise.all([
      prisma.channel.findMany({ take: perPage, skip, orderBy: { createdAt: 'desc' } }),
      prisma.channel.count(),
    ]);

    return res.json({ data: rows, meta: { page, perPage, total } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export default { createChannel, listChannels };
