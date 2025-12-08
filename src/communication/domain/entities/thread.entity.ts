export class ThreadEntity {
  constructor(
    public id: string,
    public messageId: string,
    public createdBy?: string,
  ) {}
}

export default ThreadEntity;
