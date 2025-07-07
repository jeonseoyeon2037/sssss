const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// 공통 값
const projectId = 'project_001';
const steps = ['기획', '디자인', '개발', '테스트', '배포'];

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

// ─────────────────────────────────────────
// 1. project_simulations
async function seedProjectSimulations() {
  const sim_dates = Array.from({ length: 50 }, () =>
    dayjs('2024-06-01').add(Math.floor(Math.random() * 20), 'day').toDate()
  );

  const step_delays = steps.map(step => ({
    step,
    delays: Array.from({ length: 20 }, () => Math.floor(Math.random() * 60)),
  }));

  await db.collection('project_simulations').add({
    project_id: projectId,
    sim_dates,
    step_delays,
    created_at: admin.firestore.Timestamp.now(),
  });

  console.log('✅ project_simulations 완료');
}

// ─────────────────────────────────────────
// 2. project_progress
async function seedProjectProgress() {
  const time = [];
  const pct_complete = [];

  for (let i = 0; i < 10; i++) {
    time.push(dayjs('2024-06-01').add(i, 'day').toDate());
    pct_complete.push(Math.min(100, i * 10 + Math.floor(Math.random() * 10)));
  }

  await db.collection('project_progress').add({
    project_id: projectId,
    time,
    pct_complete,
    created_at: admin.firestore.Timestamp.now(),
  });

  console.log('✅ project_progress 완료');
}

// ─────────────────────────────────────────
// 3. project_costs
async function seedProjectCosts() {
  const time = [];
  const cum_cost = [];
  let cost = 0;

  for (let i = 0; i < 10; i++) {
    time.push(dayjs('2024-06-01').add(i, 'day').toDate());
    cost += Math.floor(100000 + Math.random() * 50000);
    cum_cost.push(cost);
  }

  await db.collection('project_costs').add({
    project_id: projectId,
    time,
    cum_cost,
    created_at: admin.firestore.Timestamp.now(),
  });

  console.log('✅ project_costs 완료');
}

// ─────────────────────────────────────────
// 4. project_dependencies
async function seedProjectDependencies() {
  for (let i = 0; i < steps.length - 1; i++) {
    await db.collection('project_dependencies').add({
      project_id: projectId,
      from: steps[i],
      to: steps[i + 1],
      duration: 240 + Math.floor(Math.random() * 60),
      type: 'FS',
    });

    console.log(`🔗 ${steps[i]} → ${steps[i + 1]} 의존성 추가`);
  }

  console.log('✅ project_dependencies 완료');
}

// ─────────────────────────────────────────
// 실행
async function runAllSeeds() {
  console.log('\n🚀 Firestore 보조 컬렉션 시드 시작');
  await seedProjectSimulations();
  await seedProjectProgress();
  await seedProjectCosts();
  await seedProjectDependencies();
  console.log('🎉 모든 보조 컬렉션 시드 완료!');
}

runAllSeeds();
