export class TeamInvitationEntity {
  constructor(
    public id: string,
    public teamId: string,
    public email: string,
    public invitedById?: string,
    public role?: string,
    public token?: string,
    public status?: string,
    public expiresAt?: Date,
    public acceptedAt?: Date,
  ) {}
}

export default TeamInvitationEntity;
