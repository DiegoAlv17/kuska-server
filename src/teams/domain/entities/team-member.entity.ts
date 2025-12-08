export class TeamMemberEntity {
  constructor(
    public id: string,
    public teamId: string,
    public userId: string,
    public role: string,
    public joinedAt?: Date,
    public leftAt?: Date,
  ) {}
}

export default TeamMemberEntity;
