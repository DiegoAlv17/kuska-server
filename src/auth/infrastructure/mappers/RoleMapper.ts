import { Role as PrismaRole } from '@prisma/client';
import { Role, IRole } from '../../domain/entities/Role';

export class RoleMapper {
  static toDomain(prismaRole: PrismaRole): Role {
    const roleData: IRole = {
      id: prismaRole.id,
      name: prismaRole.name,
      description: prismaRole.description || undefined,
      permissions: prismaRole.permissions as Record<string, any>,
      createdAt: prismaRole.createdAt,
      updatedAt: prismaRole.updatedAt,
    };

    return new Role(roleData);
  }

  static toPrisma(role: Role): Omit<PrismaRole, 'createdAt' | 'updatedAt'> {
    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription() || null,
      permissions: role.getPermissions(),
    };
  }

  static toPrismaCreate(role: Role) {
    return {
      id: role.getId(),
      name: role.getName(),
      description: role.getDescription(),
      permissions: role.getPermissions(),
    };
  }

  static toPrismaUpdate(role: Role) {
    return {
      name: role.getName(),
      description: role.getDescription(),
      permissions: role.getPermissions(),
      updatedAt: new Date(),
    };
  }
}
