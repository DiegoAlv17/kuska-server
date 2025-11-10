import { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema } from '../../application/dtos/RegisterUserDto';
import { LoginUserSchema } from '../../application/dtos/LoginUserDto';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshTokenUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaRoleRepository } from '../repositories/PrismaRoleRepository';
import { BcryptPasswordService } from '../services/BcryptPasswordService';
import { JwtTokenService } from '../services/JwtTokenService';

export class AuthController {
  private registerUserUseCase: RegisterUserUseCase;
  private loginUserUseCase: LoginUserUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private getCurrentUserUseCase: GetCurrentUserUseCase;

  constructor() {
    // Inicializar dependencias
    const userRepository = new PrismaUserRepository();
    const roleRepository = new PrismaRoleRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JwtTokenService();

    // Inicializar casos de uso
    this.registerUserUseCase = new RegisterUserUseCase(
      userRepository,
      roleRepository,
      passwordService,
      tokenService
    );

    this.loginUserUseCase = new LoginUserUseCase(
      userRepository,
      passwordService,
      tokenService
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

    this.getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validar datos con Zod
      const validatedData = RegisterUserSchema.parse(req.body);

      // Ejecutar caso de uso
      const result = await this.registerUserUseCase.execute(validatedData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validar datos con Zod
      const validatedData = LoginUserSchema.parse(req.body);

      // Ejecutar caso de uso
      const result = await this.loginUserUseCase.execute(validatedData);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      // Ejecutar caso de uso
      const result = await this.refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Ejecutar caso de uso
      const result = await this.getCurrentUserUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Por ahora solo retornamos éxito
      // En el futuro podríamos implementar blacklist de tokens con Redis
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };
}
