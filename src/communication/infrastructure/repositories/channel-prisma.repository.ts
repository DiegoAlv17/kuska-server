import { prisma } from '../../auth/infrastructure/persistence/PrismaClient';
import { Channel } from '@prisma/client';
import { ChannelEntity } from '../../domain/entities/channel.entity';
import { ChannelRepository } from '../../domain/repositories/channel-repository.interface';

export class ChannelPrismaRepository implements ChannelRepository {
  async create(data: Partial<ChannelEntity>): Promise<ChannelEntity> {
    const created: Channel = await prisma.channel.create({ data: data as any });
    return created as unknown as ChannelEntity;
  }

  async findById(id: string): Promise<ChannelEntity | null> {
    const ch = await prisma.channel.findUnique({ where: { id } });
    return ch as unknown as ChannelEntity | null;
  }
}

export default ChannelPrismaRepository;
