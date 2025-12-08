export class ReactionEntity {
  constructor(
    public id: string,
    public messageId: string,
    public userId: string,
    public emoji: string,
  ) {}
}

export default ReactionEntity;
