export class UserProfileException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserProfileException';
  }
}

export class InvalidProfileDataException extends UserProfileException {
  constructor(field: string, message: string) {
    super(`Invalid ${field}: ${message}`);
    this.name = 'InvalidProfileDataException';
  }
}
