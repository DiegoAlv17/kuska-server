export interface UserBasicInfoDto {
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

export interface CompletedProjectDto {
  id: string;
  name: string;
  description?: string;
  role: string;
  status: string;
  completedAt?: Date;
}

export interface UserProfileResponseDto {
  user: UserBasicInfoDto;
  currentWork: CurrentWorkItemDto[];
  completedProjects: CompletedProjectDto[];
}

import { CurrentWorkItemDto } from './CurrentWorkDto';
