export class MessageEntity {
  constructor(
    public id: string,
    public channelId: string,
    public userId?: string,
    public content?: string,
    public messageType?: string,
    public parentId?: string,
    public isEdited?: boolean,
    public createdAt?: Date,
  ) {}
}

export default MessageEntity;
