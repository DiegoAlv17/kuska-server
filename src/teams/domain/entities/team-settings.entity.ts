export class TeamSettingsEntity {
  constructor(
    public id: string,
    public teamId: string,
    public settings: Record<string, any> = {},
  ) {}
}

export default TeamSettingsEntity;
