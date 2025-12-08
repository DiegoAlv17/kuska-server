import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { UserResponseDto } from '../dtos/UserResponseDto';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    // Buscar usuario por ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Mapear a DTO de respuesta
    const userResponse: UserResponseDto = {
      id: user.getId(),
      email: user.getEmail().getValue(),
      completeName: user.getCompleteName(),
      avatar: user.getAvatar(),
      phone: user.getPhone(),
      jobTitle: user.getJobTitle(),
      location: user.getLocation(),
      organization: user.getOrganization(),
      timezone: user.getTimezone(),
      locale: user.getLocale(),
      isActive: user.isActive(),
      lastLogin: user.getLastLogin(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    return userResponse;
  }
}
