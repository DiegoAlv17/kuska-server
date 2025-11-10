import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

export interface IUser {
  id: string;
  email: Email;
  password: Password;
  completeName: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  locale: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: string;
  private email: Email;
  private password: Password;
  private completeName: string;
  private avatar?: string;
  private phone?: string;
  private timezone: string;
  private locale: string;
  private _isActive: boolean;
  private lastLogin?: Date;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: IUser) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.completeName = props.completeName;
    this.avatar = props.avatar;
    this.phone = props.phone;
    this.timezone = props.timezone;
    this.locale = props.locale;
    this._isActive = props.isActive;
    this.lastLogin = props.lastLogin;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getCompleteName(): string {
    return this.completeName;
  }

  getAvatar(): string | undefined {
    return this.avatar;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  getTimezone(): string {
    return this.timezone;
  }

  getLocale(): string {
    return this.locale;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getLastLogin(): Date | undefined {
    return this.lastLogin;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateLastLogin(): void {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this.updatedAt = new Date();
  }

  updateProfile(data: {
    completeName?: string;
    avatar?: string;
    phone?: string;
    timezone?: string;
    locale?: string;
  }): void {
    if (data.completeName) this.completeName = data.completeName;
    if (data.avatar !== undefined) this.avatar = data.avatar;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.timezone) this.timezone = data.timezone;
    if (data.locale) this.locale = data.locale;
    this.updatedAt = new Date();
  }

  changePassword(newPassword: Password): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
