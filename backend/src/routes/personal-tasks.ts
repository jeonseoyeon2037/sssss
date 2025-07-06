import express from 'express';
import { getFirestoreDB } from '../config/firebase';
import { DocumentSnapshot } from 'firebase-admin/firestore';

const router = express.Router();

// GET /api/personal-tasks - personal_tasks 컬렉션의 모든 데이터 가져오기
router.get('/', async (_req, res) => {
  try {
    const db = getFirestoreDB();
    const snapshot = await db.collection('personal_tasks').get();
    
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

// GET /api/personal-tasks/:userId - 특정 사용자의 personal_tasks 가져오기
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getFirestoreDB();
    
    const snapshot = await db.collection('personal_tasks')
      .where('user_id', '==', userId)
      .get();
    
    const tasks = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks for user:', error);
    res.status(500).json({ error: 'Failed to fetch personal tasks for user' });
  }
});

export default router; 