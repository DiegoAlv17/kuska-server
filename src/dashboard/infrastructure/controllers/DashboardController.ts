import { Request, Response, NextFunction } from 'express';
import { GetUserStatsUseCase } from '../../application/use-cases/GetUserStatsUseCase';
import { GetTodayActivitiesUseCase } from '../../application/use-cases/GetTodayActivitiesUseCase';

export class DashboardController {
  private getUserStatsUseCase: GetUserStatsUseCase;
  private getTodayActivitiesUseCase: GetTodayActivitiesUseCase;

  constructor() {
    this.getUserStatsUseCase = new GetUserStatsUseCase();
    this.getTodayActivitiesUseCase = new GetTodayActivitiesUseCase();
  }

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const stats = await this.getUserStatsUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getTodayActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      if (isNaN(date.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use ISO 8601 format.'
        });
        return;
      }

      const activities = await this.getTodayActivitiesUseCase.execute(req.user.userId, date);

      res.status(200).json({
        success: true,
        data: {
          activities,
          count: activities.length
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
