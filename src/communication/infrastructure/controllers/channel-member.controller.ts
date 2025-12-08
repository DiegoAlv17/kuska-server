import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export const addMember = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { userId, role } = req.body;
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId is required' });
    // simple create
    const created = await prisma.channelMember.create({ data: { channelId, userId, role } as any });
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const listMembers = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const perPage = Math.min(100, Math.max(1, parseInt(String(req.query.perPage || '20'), 10)));
    const skip = (page - 1) * perPage;

    const [rows, total] = await Promise.all([
      prisma.channelMember.findMany({ where: { channelId }, take: perPage, skip }),
      prisma.channelMember.count({ where: { channelId } }),
    ]);

    return res.json({ data: rows, meta: { page, perPage, total } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export default { addMember, listMembers };
