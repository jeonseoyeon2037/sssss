import express from 'express';
import { getFirestoreDB } from '../config/firebase';
import { DocumentSnapshot } from 'firebase-admin/firestore';

const router = express.Router();

// GET /api/analytics/personalTasks - PersonalScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/personalTasks', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('PersonalScheduleAnalysis').get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    res.status(500).json({ error: 'Failed to fetch personal tasks' });
  }
});

// GET /api/analytics/personal-tasks/:userId - 특정 사용자의 personal_tasks 가져오기
// router.get('/personal-tasks/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const db = getFirestoreDB();
    
//     const snapshot = await db.collection('personal_tasks')
//       .where('user_id', '==', userId)
//       .get();
    
//     const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
//       id: doc.id,
//       ...doc.data()
//     }));

//     res.json(tasks);
//   } catch (error) {
//     console.error('Error fetching personal tasks for user:', error);
//     res.status(500).json({ error: 'Failed to fetch personal tasks for user' });
//   }
// });


// GET /api/analytics/departmentTasks - DepartmentScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/departmentTasks', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('DepartmentScheduleAnalysis').get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching department tasks:', error);
    res.status(500).json({ error: 'Failed to fetch department tasks' });
  }
});

// GET /api/analytics/companyTasks - CompanyScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/companyTasks', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('CompanyScheduleAnalysis').get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching company tasks:', error);
    res.status(500).json({ error: 'Failed to fetch company tasks' });
  }
});

// GET /api/analytics/projectTasks - ProjectScheduleAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectTasks', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('ProjectScheduleAnalysis').get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Failed to fetch project tasks' });
  }
});

// GET /api/analytics/projectDependencies - ProjectDependenciesAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectDependencies', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('ProjectDependenciesAnalysis').get();
    
    const dependencies = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(dependencies);
  } catch (error) {
    console.error('Error fetching project dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch project dependencies' });
  }
});

// GET /api/analytics/projectSimulations - ProjectSimulationsAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectSimulations', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('ProjectSimulationsAnalysis').get();
    
    const simulations = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(simulations);
  } catch (error) {
    console.error('Error fetching project simulations:', error);
    res.status(500).json({ error: 'Failed to fetch project simulations' });
  }
});

// GET /api/analytics/projectProgress - ProjectProgressAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectProgress', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('ProjectProgressAnalysis').get();

    const progress = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(progress);
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({ error: 'Failed to fetch project progress' });
  }
});


// GET /api/analytics/projectCosts - projectCostsAnalysis 컬렉션의 모든 데이터 가져오기
router.get('/projectCosts', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('projectCostsAnalysis').get();  

    const costs = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(costs);  
  } catch (error) {
    console.error('Error fetching project costs:', error);
    res.status(500).json({ error: 'Failed to fetch project costs' });
  }
});

export default router; 