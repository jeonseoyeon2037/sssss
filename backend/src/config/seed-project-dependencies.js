const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectId = 'project_001'; // 실제 사용 중인 프로젝트 ID로 교체
const steps = ['기획', '디자인', '개발', '테스트', '배포'];

async function seedProjectDependencies() {
  for (let i = 0; i < steps.length - 1; i++) {
    const from = steps[i];
    const to = steps[i + 1];

    const dependency = {
      project_id: projectId,
      from,
      to,
      duration: 240 + Math.floor(Math.random() * 60), // 4~5시간
      type: 'FS', // 기본 Finish-Start 관계
    };

    const ref = db.collection('project_dependencies').doc();
    await ref.set(dependency);
    console.log(`🔗 ${from} → ${to} 의존성 추가 완료`);
  }

  console.log('✅ 모든 project_dependencies 데이터 삽입 완료!');
}

seedProjectDependencies();
