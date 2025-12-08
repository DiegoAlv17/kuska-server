export class ChannelEntity {
  constructor(
    public id: string,
    public name: string,
    public description?: string,
    public type?: string,
    public projectId?: string,
    public teamId?: string,
  ) {}
}

export default ChannelEntity;
