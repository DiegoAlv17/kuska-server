import { v4 as uuidv4 } from 'uuid';
import { Favorite } from '../../domain/entities/Favorite';
import { IFavoriteRepository } from '../../domain/repositories/IFavoriteRepository';

export class ToggleFavoriteUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(projectId: string, userId: string): Promise<{ isFavorite: boolean; message: string }> {
    const existing = await this.favoriteRepository.findByProjectAndUser(projectId, userId);

    if (existing) {
      // Remove from favorites
      await this.favoriteRepository.delete(projectId, userId);
      return {
        isFavorite: false,
        message: 'Proyecto removido de favoritos'
      };
    } else {
      // Add to favorites
      const now = new Date();
      const favorite = new Favorite({
        id: uuidv4(),
        projectId,
        userId,
        createdAt: now,
        lastAccessed: now
      });

      await this.favoriteRepository.create(favorite);

      return {
        isFavorite: true,
        message: 'Proyecto marcado como favorito'
      };
    }
  }
}
