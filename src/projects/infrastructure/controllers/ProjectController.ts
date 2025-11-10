import { Request, Response } from 'express';

export class ProjectController {
  // Placeholder: Listar proyectos
  getProjects = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Get projects - Coming soon',
      data: {
        projects: [],
        user: req.user,
      },
    });
  };

  // Placeholder: Obtener un proyecto por ID
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Get project ${id} - Coming soon`,
      data: {
        projectId: id,
        user: req.user,
      },
    });
  };

  // Placeholder: Crear proyecto
  createProject = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json({
      success: true,
      message: 'Create project - Coming soon',
      data: {
        body: req.body,
        user: req.user,
      },
    });
  };

  // Placeholder: Actualizar proyecto
  updateProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Update project ${id} - Coming soon`,
      data: {
        projectId: id,
        body: req.body,
        user: req.user,
      },
    });
  };

  // Placeholder: Eliminar proyecto
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Delete project ${id} - Coming soon`,
      data: {
        projectId: id,
        user: req.user,
      },
    });
  };
}
