import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    // Verificar refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    // Buscar usuario
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UserNotFoundException(payload.userId);
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new Error('User account is deactivated');
    }

    // Generar nuevo access token
    const accessToken = this.tokenService.generateAccessToken(
      user.getId(),
      user.getEmail().getValue()
    );

    return { accessToken };
  }
}
