export interface UserResponseDto {
  id: string;
  email: string;
  completeName: string;
  avatar?: string;
  phone?: string;
  jobTitle?: string;
  location?: string;
  organization?: string;
  timezone: string;
  locale: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
