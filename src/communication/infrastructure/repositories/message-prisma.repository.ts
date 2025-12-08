import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { Message } from '@prisma/client';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageRepository } from '../../domain/repositories/message-repository.interface';

export class MessagePrismaRepository implements MessageRepository {
  async create(message: Partial<MessageEntity>): Promise<MessageEntity> {
    const created = await prisma.message.create({ data: message as any });
    return created as unknown as MessageEntity;
  }

  async findByChannel(channelId: string, limit = 50, offset = 0): Promise<MessageEntity[]> {
    const rows: Message[] = await prisma.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return rows as unknown as MessageEntity[];
  }
}

export default MessagePrismaRepository;
