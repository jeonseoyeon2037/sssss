const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectId = 'project_001';

async function seedProjectCosts() {
  const time = [];
  const cum_cost = [];

  let cost = 0;

  for (let i = 0; i < 10; i++) {
    const date = dayjs('2024-06-01').add(i, 'day');
    time.push(date.toDate());
    cost += Math.floor(100000 + Math.random() * 50000); // 누적 비용 증가
    cum_cost.push(cost);
  }

  const doc = {
    project_id: projectId,
    time,
    cum_cost,
    created_at: admin.firestore.Timestamp.now(),
  };

  const ref = db.collection('project_costs').doc();
  await ref.set(doc);

  console.log('✅ 누적 비용 타임라인 삽입 완료!');
}

seedProjectCosts();
