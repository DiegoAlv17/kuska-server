import { IUserRepository } from '../../../auth/domain/repositories/IUserRepository';
import { UserNotFoundException } from '../../../auth/domain/exceptions/UserNotFoundException';
import { GetTodayActivitiesUseCase } from '../../../dashboard/application/use-cases/GetTodayActivitiesUseCase';
import { ListUserProjectsUseCase } from '../../../projects/application/use-cases/ListUserProjectsUseCase';
import { UserProfileResponseDto, UserBasicInfoDto, CompletedProjectDto } from '../dtos/UserProfileResponseDto';
import { CurrentWorkItemDto } from '../dtos/CurrentWorkDto';

export class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getTodayActivitiesUseCase: GetTodayActivitiesUseCase,
    private readonly listUserProjectsUseCase: ListUserProjectsUseCase
  ) {}

  async execute(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const activities = await this.getTodayActivitiesUseCase.execute(userId);

    const allProjects = await this.listUserProjectsUseCase.execute(userId);

    const completedProjects: CompletedProjectDto[] = allProjects
      .filter(project => project.status === 'COMPLETED')
      .map(project => {
        const userMembership = project.members?.find(m => m.userId === userId);
        const role = userMembership ? userMembership.role :
                    (project.createdById === userId ? 'ADMIN' : 'MEMBER');

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          role: role,
          status: project.status,
          completedAt: project.updatedAt,
        };
      });

    const currentWork: CurrentWorkItemDto[] = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      projectName: activity.projectName,
      projectId: activity.projectId,
      type: activity.type,
    }));

    const userInfo: UserBasicInfoDto = {
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

    return {
      user: userInfo,
      currentWork,
      completedProjects,
    };
  }
}
