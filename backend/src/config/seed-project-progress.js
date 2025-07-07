const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectId = 'project_001';

async function seedProjectProgress() {
  const time = [];
  const pct_complete = [];

  for (let i = 0; i < 10; i++) {
    const date = dayjs('2024-06-01').add(i, 'day');
    time.push(date.toDate());
    pct_complete.push(Math.min(100, i * 10 + Math.floor(Math.random() * 5))); // 0~100%
  }

  const doc = {
    project_id: projectId,
    time,
    pct_complete,
    created_at: admin.firestore.Timestamp.now(),
  };

  const ref = db.collection('project_progress').doc();
  await ref.set(doc);

  console.log('✅ 프로젝트 진행률 타임라인 삽입 완료!');
}

seedProjectProgress();
