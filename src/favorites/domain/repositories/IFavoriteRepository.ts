import { Favorite } from '../entities/Favorite';

export interface FavoriteWithProject {
  favorite: Favorite;
  project: {
    id: string;
    name: string;
    code: string;
    status: string;
    taskCount: number;
  };
}

export interface IFavoriteRepository {
  create(favorite: Favorite): Promise<Favorite>;
  findByProjectAndUser(projectId: string, userId: string): Promise<Favorite | null>;
  findByUser(userId: string): Promise<FavoriteWithProject[]>;
  delete(projectId: string, userId: string): Promise<void>;
  updateLastAccessed(projectId: string, userId: string): Promise<void>;
}
