import { User as PrismaUser } from '@prisma/client';
import { User, IUser } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    const userData: IUser = {
      id: prismaUser.id,
      email: new Email(prismaUser.email),
      password: new Password(prismaUser.password, true), // true = ya está hasheada
      completeName: prismaUser.completeName,
      avatar: prismaUser.avatar || undefined,
      phone: prismaUser.phone || undefined,
      timezone: prismaUser.timezone,
      locale: prismaUser.locale,
      isActive: prismaUser.isActive,
      lastLogin: prismaUser.lastLogin || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };

    return new User(userData);
  }

  static toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
      completeName: user.getCompleteName(),
      avatar: user.getAvatar() || null,
      phone: user.getPhone() || null,
      timezone: user.getTimezone(),
      locale: user.getLocale(),
      isActive: user.isActive(),
      lastLogin: user.getLastLogin() || null,
    };
  }

  static toPrismaCreate(user: User) {
    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
      completeName: user.getCompleteName(),
      avatar: user.getAvatar(),
      phone: user.getPhone(),
      timezone: user.getTimezone(),
      locale: user.getLocale(),
      isActive: user.isActive(),
      lastLogin: user.getLastLogin(),
    };
  }

  static toPrismaUpdate(user: User) {
    return {
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
      completeName: user.getCompleteName(),
      avatar: user.getAvatar(),
      phone: user.getPhone(),
      timezone: user.getTimezone(),
      locale: user.getLocale(),
      isActive: user.isActive(),
      lastLogin: user.getLastLogin(),
      updatedAt: new Date(),
    };
  }
}
