export class ChannelSettingsEntity {
  constructor(
    public id: string,
    public channelId: string,
    public settings: Record<string, any> = {},
  ) {}
}

export default ChannelSettingsEntity;
