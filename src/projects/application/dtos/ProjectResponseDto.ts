export interface ProjectMemberResponseDto {
  id: string;
  userId: string;
  userEmail: string;
  userCompleteName: string;
  role: string;
  addedAt: Date;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  code: string;
  status: string;
  type: string;
  createdById: string;
  createdByEmail: string;
  createdByName: string;
  members?: ProjectMemberResponseDto[];
  template?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    industry?: string;
    complexity: string;
    content: Record<string, any>;
    templateType: string;
    isPublic: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
