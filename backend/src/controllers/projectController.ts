import { Request, Response, NextFunction } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  CreateProjectData,
  UpdateProjectData
} from '../services/projectService';
import { BadRequestError } from '../middleware/errorHandler';

// 프로젝트 목록 조회
export const getProjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { team, status, created_by } = req.query;
    
    const filters: any = {};
    if (team) filters.team = team as string;
    if (status) filters.status = status as string;
    if (created_by) filters.created_by = created_by as string;

    const projects = await getProjects(filters);

    res.json({
      success: true,
      data: projects,
      message: '프로젝트 목록 조회 완료',
      total: projects.length
    });
  } catch (error) {
    next(error);
  }
};

// 프로젝트 상세 조회
export const getProjectByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('프로젝트 ID가 필요합니다.');
    }
    const project = await getProjectById(id);

    res.json({
      success: true,
      data: project,
      message: '프로젝트 상세 조회 완료'
    });
  } catch (error) {
    next(error);
  }
};

// 프로젝트 생성
export const createProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      deadline,
      team,
      members,
      created_by
    } = req.body;

    // 필수 필드 검증
    if (!name || !team || !created_by) {
      throw new BadRequestError('프로젝트 이름, 팀, 생성자는 필수입니다.');
    }

    // 날짜 형식 검증
    let deadlineDate: Date;
    try {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new BadRequestError('유효하지 않은 마감일 형식입니다.');
      }
    } catch (error) {
      throw new BadRequestError('유효하지 않은 마감일 형식입니다.');
    }

    const projectData: CreateProjectData = {
      name,
      description: description || '',
      deadline: deadlineDate,
      team,
      members: members || [],
      created_by
    };

    const newProject = await createProject(projectData);

    res.status(201).json({
      success: true,
      data: newProject,
      message: '프로젝트가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

// 프로젝트 수정
export const updateProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('프로젝트 ID가 필요합니다.');
    }
    const updateData: UpdateProjectData = { ...req.body };

    // 날짜 형식 검증
    if (updateData.deadline) {
      try {
        updateData.deadline = new Date(updateData.deadline);
        if (isNaN(updateData.deadline.getTime())) {
          throw new BadRequestError('유효하지 않은 마감일 형식입니다.');
        }
      } catch (error) {
        throw new BadRequestError('유효하지 않은 마감일 형식입니다.');
      }
    }

    const updatedProject = await updateProject(id, updateData);

    res.json({
      success: true,
      data: updatedProject,
      message: '프로젝트가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

// 프로젝트 삭제
export const deleteProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('프로젝트 ID가 필요합니다.');
    }
    await deleteProject(id);

    res.json({
      success: true,
      message: '프로젝트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

// 프로젝트 상태 변경
export const updateProjectStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('프로젝트 ID가 필요합니다.');
    }
    const { status } = req.body;

    // 상태값 검증
    const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('유효하지 않은 상태값입니다.');
    }

    const updatedProject = await updateProjectStatus(id, status);

    res.json({
      success: true,
      data: updatedProject,
      message: '프로젝트 상태가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    next(error);
  }
}; 