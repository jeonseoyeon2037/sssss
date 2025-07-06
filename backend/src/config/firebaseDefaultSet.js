const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Firebase Admin 초기화
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.post('/init-firestore', async (req, res) => {
  try {
    // 1. personal_tasks
    await db.collection('personal_tasks').doc('init_doc').set({
      user_id: 'user_001',
      date: '2025-07-01',
      status: 'completed',
      start_time: new Date(),
      end_time: new Date(),
      duration: 60,
      tag: '업무',
      emotion: 4,
    });

    // 2. department_tasks
    await db.collection('department_tasks').doc('init_doc').set({
      department: '개발팀',
      assignee: 'user_001',
      type: 'meeting',
      assigned_time: new Date(),
      start_time: new Date(),
      delay: 15,
      hours: 90,
      duration: 75,
      quality: 5,
      participant_ids: ['user_002', 'user_003'],
      month: '2025-07',
      late: 1,
    });

    // 3. project_tasks
    await db.collection('project_tasks').doc('init_doc').set({
      project_id: 'project_001',
      task_name: '기획 검토',
      planned_start: new Date(),
      planned_end: new Date(),
      actual_start: new Date(),
      actual_end: new Date(),
      planned_duration: 120,
      actual_duration: 135,
      delta: 15,
      step: '기획',
      lag: 10,
      status: 'completed',
    });

    // 4. company_metrics
    await db.collection('company_metrics').doc('init_doc').set({
      department: '마케팅팀',
      date: '2025-07-06',
      month: '2025-07',
      hours: 300,
      revenue: 2500000,
      prod: 82,
      fatigue: 2.7,
      CS_count: 14,
      ROI: 19.5,
      source: '개발',
      target: '성과',
      value: 50,
    });

    res.status(200).json({ message: '✅ Firestore 컬렉션 초기화 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Firestore 초기화 실패', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
