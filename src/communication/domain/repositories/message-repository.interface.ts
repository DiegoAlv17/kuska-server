import { MessageEntity } from '../entities/message.entity';

export interface MessageRepository {
  create(message: Partial<MessageEntity>): Promise<MessageEntity>;
  findByChannel(channelId: string, limit?: number, offset?: number): Promise<MessageEntity[]>;
}

export default MessageRepository;
