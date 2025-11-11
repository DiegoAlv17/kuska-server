export class ProjectCode {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Project code cannot be empty');
    }

    // Validar formato: solo letras mayúsculas, números y guiones, 2-10 caracteres
    const codeRegex = /^[A-Z0-9-]{2,10}$/;
    if (!codeRegex.test(value)) {
      throw new Error(
        'Project code must be 2-10 characters, uppercase letters, numbers and hyphens only'
      );
    }

    this.value = value.toUpperCase();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
