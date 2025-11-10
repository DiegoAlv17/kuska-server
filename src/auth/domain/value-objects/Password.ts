export class Password {
  private readonly value: string;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed) {
      this.validate(password);
    }
    this.value = password;
  }

  private validate(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password is too long');
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Al menos un número
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
