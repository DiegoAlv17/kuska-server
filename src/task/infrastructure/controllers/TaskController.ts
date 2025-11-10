import { Request, Response } from 'express';

export class TaskController {
  // Placeholder: Listar tareas
  getTasks = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Get tasks - Coming soon',
      data: {
        tasks: [],
        user: req.user,
      },
    });
  };

  // Placeholder: Obtener una tarea por ID
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Get task ${id} - Coming soon`,
      data: {
        taskId: id,
        user: req.user,
      },
    });
  };

  // Placeholder: Crear tarea
  createTask = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json({
      success: true,
      message: 'Create task - Coming soon',
      data: {
        body: req.body,
        user: req.user,
      },
    });
  };

  // Placeholder: Actualizar tarea
  updateTask = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Update task ${id} - Coming soon`,
      data: {
        taskId: id,
        body: req.body,
        user: req.user,
      },
    });
  };

  // Placeholder: Eliminar tarea
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Delete task ${id} - Coming soon`,
      data: {
        taskId: id,
        user: req.user,
      },
    });
  };
}
