import { ChannelEntity } from '../entities/channel.entity';

export interface ChannelRepository {
  create(data: Partial<ChannelEntity>): Promise<ChannelEntity>;
  findById(id: string): Promise<ChannelEntity | null>;
}

export default ChannelRepository;
