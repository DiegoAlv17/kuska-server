import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { UserAlreadyExistsException } from '../../domain/exceptions/UserAlreadyExistsException';
import { BcryptPasswordService } from '../../infrastructure/services/BcryptPasswordService';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { AuthResponseDto } from '../dtos/AuthResponseDto';
import { UserResponseDto } from '../dtos/UserResponseDto';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly passwordService: BcryptPasswordService,
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(dto.email);
    }

    // Hashear contraseña
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Crear usuario
    const user = new User({
      id: uuidv4(),
      email: new Email(dto.email),
      password: new Password(hashedPassword, true), // true = ya está hasheada
      completeName: dto.completeName,
      phone: dto.phone,
      timezone: 'UTC',
      locale: 'es',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Guardar usuario
    const savedUser = await this.userRepository.create(user);

    // Generar tokens
    const accessToken = this.tokenService.generateAccessToken(
      savedUser.getId(),
      savedUser.getEmail().getValue()
    );
    const refreshToken = this.tokenService.generateRefreshToken(savedUser.getId());

    // Mapear a DTO de respuesta
    const userResponse: UserResponseDto = {
      id: savedUser.getId(),
      email: savedUser.getEmail().getValue(),
      completeName: savedUser.getCompleteName(),
      avatar: savedUser.getAvatar(),
      phone: savedUser.getPhone(),
      timezone: savedUser.getTimezone(),
      locale: savedUser.getLocale(),
      isActive: savedUser.isActive(),
      lastLogin: savedUser.getLastLogin(),
      createdAt: savedUser.getCreatedAt(),
      updatedAt: savedUser.getUpdatedAt(),
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }
}
