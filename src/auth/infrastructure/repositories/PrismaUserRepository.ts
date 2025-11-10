import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { prisma } from '../persistence/PrismaClient';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async create(user: User): Promise<User> {
    const data = UserMapper.toPrismaCreate(user);

    const createdUser = await prisma.user.create({
      data,
    });

    return UserMapper.toDomain(createdUser);
  }

  async update(user: User): Promise<User> {
    const data = UserMapper.toPrismaUpdate(user);

    const updatedUser = await prisma.user.update({
      where: { id: user.getId() },
      data,
    });

    return UserMapper.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
