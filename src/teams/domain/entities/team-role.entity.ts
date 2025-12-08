export class TeamRoleEntity {
  constructor(
    public id: string,
    public name: string,
    public permissions: string[] = [],
  ) {}
}

export default TeamRoleEntity;
