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
    // Pagination params
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
