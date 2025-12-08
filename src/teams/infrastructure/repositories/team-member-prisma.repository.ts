import { prisma } from '../../auth/infrastructure/persistence/PrismaClient';
import { TeamMember } from '@prisma/client';
import { TeamMemberEntity } from '../../domain/entities/team-member.entity';

export class TeamMemberPrismaRepository {
  async add(member: Partial<TeamMemberEntity>): Promise<TeamMemberEntity> {
    const created: TeamMember = await prisma.teamMember.create({ data: member as any });
    return created as unknown as TeamMemberEntity;
  }

  async listByTeam(teamId: string): Promise<TeamMemberEntity[]> {
    const rows: TeamMember[] = await prisma.teamMember.findMany({ where: { teamId } });
    return rows as unknown as TeamMemberEntity[];
  }
}

export default TeamMemberPrismaRepository;
