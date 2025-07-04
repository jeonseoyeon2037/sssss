import { Router } from 'express';
import {
  getProjectsController,
  getProjectByIdController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
  updateProjectStatusController
} from '../controllers/projectController';

const router = Router();

// 프로젝트 CRUD 라우트
router.get('/', getProjectsController);
router.post('/', createProjectController);
router.get('/:id', getProjectByIdController);
router.put('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

// 프로젝트 상태 변경
router.put('/:id/status', updateProjectStatusController);

export default router; 