export class TeamEntity {
  constructor(
    public id: string,
    public name: string,
    public description?: string,
    public leaderId?: string,
    public projectId?: string,
  ) {}
}

export default TeamEntity;
