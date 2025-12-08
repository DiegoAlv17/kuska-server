import { IUserRepository } from '../../../auth/domain/repositories/IUserRepository';
import { UserNotFoundException } from '../../../auth/domain/exceptions/UserNotFoundException';
import { UpdateProfileDto } from '../dtos/UpdateProfileDto';
import { UserBasicInfoDto } from '../dtos/UserProfileResponseDto';

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileDto): Promise<UserBasicInfoDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    user.updateProfile({
      phone: data.phone === '' ? undefined : data.phone,
      avatar: data.avatar === '' ? undefined : data.avatar,
      jobTitle: data.jobTitle,
      location: data.location,
      organization: data.organization,
    });

    const updatedUser = await this.userRepository.update(user);

    return {
      id: updatedUser.getId(),
      email: updatedUser.getEmail().getValue(),
      completeName: updatedUser.getCompleteName(),
      avatar: updatedUser.getAvatar(),
      phone: updatedUser.getPhone(),
      jobTitle: updatedUser.getJobTitle(),
      location: updatedUser.getLocation(),
      organization: updatedUser.getOrganization(),
      timezone: updatedUser.getTimezone(),
      locale: updatedUser.getLocale(),
      isActive: updatedUser.isActive(),
      lastLogin: updatedUser.getLastLogin(),
      createdAt: updatedUser.getCreatedAt(),
      updatedAt: updatedUser.getUpdatedAt(),
    };
  }
}
