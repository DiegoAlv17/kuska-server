export interface TemplateResponseDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  industry?: string;
  complexity: string;
  content: Record<string, any>;
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  createdById: string;
  // ✅ Opcional: incluir solo si necesitas esta info
  createdByEmail?: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  // 🆕 Podrías agregar:
  version?: number; // Si manejas versionado
  canEdit?: boolean; // Para permisos en UI
}