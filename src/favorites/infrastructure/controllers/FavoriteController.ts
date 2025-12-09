import { Request, Response, NextFunction } from 'express';
import { GetFavoritesUseCase } from '../../application/use-cases/GetFavoritesUseCase';
import { ToggleFavoriteUseCase } from '../../application/use-cases/ToggleFavoriteUseCase';
import { PrismaFavoriteRepository } from '../repositories/PrismaFavoriteRepository';

export class FavoriteController {
  private getFavoritesUseCase: GetFavoritesUseCase;
  private toggleFavoriteUseCase: ToggleFavoriteUseCase;

  constructor() {
    const favoriteRepository = new PrismaFavoriteRepository();
    this.getFavoritesUseCase = new GetFavoritesUseCase(favoriteRepository);
    this.toggleFavoriteUseCase = new ToggleFavoriteUseCase(favoriteRepository);
  }

  getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const favorites = await this.getFavoritesUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          boards: favorites.map(fav => ({
            id: fav.favorite.getId(),
            projectId: fav.project.id,
            projectName: fav.project.name,
            projectCode: fav.project.code,
            name: `Tablero: ${fav.project.name}`,
            isFavorite: true,
            taskCount: fav.project.taskCount,
            lastAccessed: fav.favorite.getLastAccessed()
          })),
          count: favorites.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { projectId } = req.params;

      const result = await this.toggleFavoriteUseCase.execute(projectId, req.user.userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
