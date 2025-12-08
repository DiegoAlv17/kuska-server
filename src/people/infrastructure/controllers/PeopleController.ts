import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class PeopleController {
  // GET /api/people?search=&page=1&limit=20
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = (req.query.search as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
      const skip = (page - 1) * limit;

      // Prisma types are strict about QueryMode; cast to any to keep this simple here
      const where: any = search
        ? {
            OR: [
              { completeName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined;

      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { completeName: 'asc' },
          select: {
            id: true,
            completeName: true,
            email: true,
            avatar: true,
          },
        }),
      ]);

      const items = users.map(u => ({
        id: u.id,
        name: u.completeName,
        email: u.email,
        avatar: u.avatar || null,
      }));

      res.json({ success: true, data: { items, total, page, limit } });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/people/invite
  // body: { input: string } - comma/newline separated emails or names
  invite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { input } = req.body as { input?: string };

      if (!input || !input.trim()) {
        res.status(400).json({ success: false, message: 'No recipients provided' });
        return;
      }

      // Split by comma or newline and normalize
      const parts = input
        .split(/[,\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const results: Array<{ raw: string; email?: string; exists?: boolean; userId?: string }> = [];

      for (const raw of parts) {
        if (raw.includes('@')) {
          const email = raw.toLowerCase();
          const user = await prisma.user.findUnique({ where: { email } });
          results.push({ raw, email, exists: !!user, userId: user ? user.id : undefined });
          // TODO: create invitation record if user not exists or send notification
        } else {
          // Treat as name — no-op for now
          results.push({ raw, exists: false });
        }
      }

      res.status(200).json({ success: true, data: { processed: results } });
    } catch (error) {
      next(error);
    }
  };
}

export default new PeopleController();
