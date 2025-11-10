import bcrypt from 'bcryptjs';

export class BcryptPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
