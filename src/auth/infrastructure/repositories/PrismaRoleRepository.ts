import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { Role } from '../../domain/entities/Role';
import { prisma } from '../persistence/PrismaClient';
import { RoleMapper } from '../mappers/RoleMapper';

export class PrismaRoleRepository implements IRoleRepository {
  async findById(id: string): Promise<Role | null> {
    const prismaRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!prismaRole) return null;

    return RoleMapper.toDomain(prismaRole);
  }

  async findByName(name: string): Promise<Role | null> {
    const prismaRole = await prisma.role.findUnique({
      where: { name },
    });

    if (!prismaRole) return null;

    return RoleMapper.toDomain(prismaRole);
  }

  async create(role: Role): Promise<Role> {
    const data = RoleMapper.toPrismaCreate(role);

    const createdRole = await prisma.role.create({
      data,
    });

    return RoleMapper.toDomain(createdRole);
  }

  async update(role: Role): Promise<Role> {
    const data = RoleMapper.toPrismaUpdate(role);

    const updatedRole = await prisma.role.update({
      where: { id: role.getId() },
      data,
    });

    return RoleMapper.toDomain(updatedRole);
  }

  async delete(id: string): Promise<void> {
    await prisma.role.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Role[]> {
    const prismaRoles = await prisma.role.findMany();
    return prismaRoles.map(RoleMapper.toDomain);
  }
}
