import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentialsException';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { BcryptPasswordService } from '../../infrastructure/services/BcryptPasswordService';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { LoginUserDto } from '../dtos/LoginUserDto';
import { AuthResponseDto } from '../dtos/AuthResponseDto';
import { UserResponseDto } from '../dtos/UserResponseDto';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: BcryptPasswordService,
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verificar contraseña
    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.getPassword().getValue()
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new Error('User account is deactivated');
    }

    // Actualizar lastLogin
    user.updateLastLogin();
    await this.userRepository.update(user);

    // Generar tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.getId(),
      user.getEmail().getValue()
    );
    const refreshToken = this.tokenService.generateRefreshToken(user.getId());

    // Mapear a DTO de respuesta
    const userResponse: UserResponseDto = {
      id: user.getId(),
      email: user.getEmail().getValue(),
      completeName: user.getCompleteName(),
      avatar: user.getAvatar(),
      phone: user.getPhone(),
      timezone: user.getTimezone(),
      locale: user.getLocale(),
      isActive: user.isActive(),
      lastLogin: user.getLastLogin(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }
}
