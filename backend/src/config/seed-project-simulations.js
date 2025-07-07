const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectId = 'project_001';
const steps = ['기획', '디자인', '개발', '테스트', '배포'];

async function seedProjectSimulations() {
  const sim_dates = [];
  const step_delays = [];

  for (let i = 0; i < 50; i++) {
    const endDate = dayjs('2024-06-01').add(Math.floor(Math.random() * 20), 'day');
    sim_dates.push(endDate.toDate());
  }

  for (const step of steps) {
    const delays = [];
    for (let i = 0; i < 20; i++) {
      delays.push(Math.floor(Math.random() * 60)); // 최대 60분 지연
    }
    step_delays.push({ step, delays });
  }

  const doc = {
    project_id: projectId,
    sim_dates, // 완료 날짜 리스트
    step_delays, // 단계별 지연 샘플
    created_at: admin.firestore.Timestamp.now(),
  };

  const ref = db.collection('project_simulations').doc();
  await ref.set(doc);

  console.log('✅ PERT 시뮬레이션 데이터 삽입 완료!');
}

seedProjectSimulations();
