import { IFavoriteRepository, FavoriteWithProject } from '../../domain/repositories/IFavoriteRepository';

export class GetFavoritesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(userId: string): Promise<FavoriteWithProject[]> {
    return await this.favoriteRepository.findByUser(userId);
  }
}
