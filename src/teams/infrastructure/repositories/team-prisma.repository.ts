import { prisma } from '../../auth/infrastructure/persistence/PrismaClient';
import { Team } from '@prisma/client';
import { TeamEntity } from '../../domain/entities/team.entity';

export class TeamPrismaRepository {
  async create(data: Partial<TeamEntity>): Promise<TeamEntity> {
    const created: Team = await prisma.team.create({ data: data as any });
    return created as unknown as TeamEntity;
  }

  async findById(id: string): Promise<TeamEntity | null> {
    const t = await prisma.team.findUnique({ where: { id } });
    return t as unknown as TeamEntity | null;
  }
}

export default TeamPrismaRepository;
