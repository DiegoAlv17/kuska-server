export class DirectMessageEntity {
  constructor(
    public id: string,
    public fromUserId: string,
    public toUserId: string,
    public content: string,
    public createdAt?: Date,
  ) {}
}

export default DirectMessageEntity;
