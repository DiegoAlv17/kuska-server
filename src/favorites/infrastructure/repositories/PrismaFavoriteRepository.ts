import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { Favorite } from '../../domain/entities/Favorite';
import { IFavoriteRepository, FavoriteWithProject } from '../../domain/repositories/IFavoriteRepository';

export class PrismaFavoriteRepository implements IFavoriteRepository {
  async create(favorite: Favorite): Promise<Favorite> {
    const prismaFavorite = await prisma.projectFavorite.create({
      data: {
        id: favorite.getId(),
        projectId: favorite.getProjectId(),
        userId: favorite.getUserId(),
        createdAt: favorite.getCreatedAt(),
        lastAccessed: favorite.getLastAccessed()
      }
    });

    return this.toDomain(prismaFavorite);
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<Favorite | null> {
    const prismaFavorite = await prisma.projectFavorite.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    return prismaFavorite ? this.toDomain(prismaFavorite) : null;
  }

  async findByUser(userId: string): Promise<FavoriteWithProject[]> {
    const favorites = await prisma.projectFavorite.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            tareas: {
              where: { deletedAt: null },
              select: { id: true }
            }
          }
        }
      },
      orderBy: { lastAccessed: 'desc' }
    });

    return favorites.map(fav => ({
      favorite: this.toDomain(fav),
      project: {
        id: fav.project.id,
        name: fav.project.name,
        code: fav.project.code,
        status: fav.project.status,
        taskCount: fav.project.tareas.length
      }
    }));
  }

  async delete(projectId: string, userId: string): Promise<void> {
    await prisma.projectFavorite.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });
  }

  async updateLastAccessed(projectId: string, userId: string): Promise<void> {
    await prisma.projectFavorite.update({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      data: {
        lastAccessed: new Date()
      }
    });
  }

  private toDomain(prismaFavorite: any): Favorite {
    return new Favorite({
      id: prismaFavorite.id,
      projectId: prismaFavorite.projectId,
      userId: prismaFavorite.userId,
      createdAt: prismaFavorite.createdAt,
      lastAccessed: prismaFavorite.lastAccessed
    });
  }
}
