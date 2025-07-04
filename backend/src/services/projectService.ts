import { getCollection, getDocument } from '../config/firebase';
import { Project } from '../types/database';
import { NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler';

export interface CreateProjectData {
  name: string;
  description: string;
  deadline: Date;
  team: string;
  members: string[];
  created_by: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  deadline?: Date;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  team?: string;
  members?: string[];
}

// 프로젝트 목록 조회
export const getProjects = async (filters?: {
  team?: string;
  status?: string;
  created_by?: string;
}): Promise<Project[]> => {
  try {
    const collectionRef = getCollection('projects');
    let query: any = collectionRef;

    // 필터 적용
    if (filters?.team) {
      query = query.where('team', '==', filters.team);
    }
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.created_by) {
      query = query.where('created_by', '==', filters.created_by);
    }

    const snapshot = await query.get();
    const projects: Project[] = [];

    snapshot.forEach((doc: any) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      } as Project);
    });

    return projects;
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    throw error;
  }
};

// 프로젝트 상세 조회
export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const docRef = getDocument('projects', id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError(`프로젝트 ID ${id}를 찾을 수 없습니다.`);
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Project;
  } catch (error) {
    console.error(`프로젝트 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

// 프로젝트 생성
export const createProject = async (projectData: CreateProjectData): Promise<Project> => {
  try {
    // 필수 필드 검증
    if (!projectData.name || !projectData.team || !projectData.created_by) {
      throw new BadRequestError('프로젝트 이름, 팀, 생성자는 필수입니다.');
    }

    // 중복 프로젝트명 검사 (같은 팀 내에서)
    const existingProjects = await getProjects({ team: projectData.team });
    const duplicateProject = existingProjects.find(p => p.name === projectData.name);
    if (duplicateProject) {
      throw new ConflictError('같은 팀 내에 동일한 이름의 프로젝트가 이미 존재합니다.');
    }

    const projectRef = getCollection('projects').doc();
    const newProject: Omit<Project, 'id'> = {
      name: projectData.name,
      description: projectData.description || '',
      deadline: projectData.deadline,
      status: 'active',
      team: projectData.team,
      members: projectData.members || [],
      created_by: projectData.created_by,
      created_at: new Date(),
      updated_at: new Date()
    };

    await projectRef.set(newProject);

    return {
      id: projectRef.id,
      ...newProject
    } as Project;
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    throw error;
  }
};

// 프로젝트 수정
export const updateProject = async (id: string, updateData: UpdateProjectData): Promise<Project> => {
  try {
    const docRef = getDocument('projects', id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError(`프로젝트 ID ${id}를 찾을 수 없습니다.`);
    }

    // 중복 프로젝트명 검사 (같은 팀 내에서, 자기 자신 제외)
    if (updateData.name) {
      const currentProject = doc.data() as Project;
      const existingProjects = await getProjects({ team: currentProject.team });
      const duplicateProject = existingProjects.find(p => 
        p.name === updateData.name && p.id !== id
      );
      if (duplicateProject) {
        throw new ConflictError('같은 팀 내에 동일한 이름의 프로젝트가 이미 존재합니다.');
      }
    }

    const updatePayload = {
      ...updateData,
      updated_at: new Date()
    };

    await docRef.update(updatePayload);

    // 업데이트된 프로젝트 반환
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Project;
  } catch (error) {
    console.error(`프로젝트 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

// 프로젝트 삭제
export const deleteProject = async (id: string): Promise<void> => {
  try {
    const docRef = getDocument('projects', id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError(`프로젝트 ID ${id}를 찾을 수 없습니다.`);
    }

    // 연관된 일정이 있는지 확인
    const schedulesRef = getCollection('schedules');
    const schedulesSnapshot = await schedulesRef.where('project_id', '==', id).get();
    
    if (!schedulesSnapshot.empty) {
      throw new ConflictError('이 프로젝트에 연결된 일정이 있어 삭제할 수 없습니다.');
    }

    await docRef.delete();
  } catch (error) {
    console.error(`프로젝트 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

// 프로젝트 상태 변경
export const updateProjectStatus = async (
  id: string, 
  status: 'active' | 'completed' | 'paused' | 'cancelled'
): Promise<Project> => {
  try {
    const docRef = getDocument('projects', id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError(`프로젝트 ID ${id}를 찾을 수 없습니다.`);
    }

    await docRef.update({
      status,
      updated_at: new Date()
    });

    // 업데이트된 프로젝트 반환
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Project;
  } catch (error) {
    console.error(`프로젝트 상태 변경 실패 (ID: ${id}):`, error);
    throw error;
  }
}; 