import { Request, Response, NextFunction } from 'express';
import { GetUserProfileUseCase } from '../../application/use-cases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/UpdateUserProfileUseCase';
import { UpdateProfileSchema } from '../../application/dtos/UpdateProfileDto';
import { PrismaUserRepository } from '../../../auth/infrastructure/repositories/PrismaUserRepository';
import { GetTodayActivitiesUseCase } from '../../../dashboard/application/use-cases/GetTodayActivitiesUseCase';
import { ListUserProjectsUseCase } from '../../../projects/application/use-cases/ListUserProjectsUseCase';
import { PrismaProjectRepository } from '../../../projects/infrastructure/repositories/PrismaProjectRepository';

export class UserProfileController {
  private getUserProfileUseCase: GetUserProfileUseCase;
  private updateUserProfileUseCase: UpdateUserProfileUseCase;

  constructor() {
    const userRepository = new PrismaUserRepository();
    const projectRepository = new PrismaProjectRepository();

    const getTodayActivitiesUseCase = new GetTodayActivitiesUseCase();
    const listUserProjectsUseCase = new ListUserProjectsUseCase(projectRepository);

    this.getUserProfileUseCase = new GetUserProfileUseCase(
      userRepository,
      getTodayActivitiesUseCase,
      listUserProjectsUseCase
    );

    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const profile = await this.getUserProfileUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const validatedData = UpdateProfileSchema.parse(req.body);

      const updatedUser = await this.updateUserProfileUseCase.execute(
        req.user.userId,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
}
