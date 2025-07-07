const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const departments = ['스마트앱개발팀', 'AI팀', '디자인팀'];
const startDate = dayjs('2024-06-01');
const days = 7;

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

async function seedCompanyMetrics() {
  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day');
    const dayStr = date.format('YYYY-MM-DD');
    const monthStr = date.format('YYYY-MM');

    for (const department of departments) {
      const data = {
        department,
        date: admin.firestore.Timestamp.fromDate(date.toDate()),
        month: monthStr,
        hours: 300 + Math.floor(Math.random() * 200), // 300~499분
        revenue: randomFloat(1_000_000, 5_000_000),
        prod: randomFloat(60, 100),
        fatigue: randomFloat(20, 80),
        CS_count: Math.floor(Math.random() * 10), // 0~9
        ROI: randomFloat(10, 80),
        source: department,
        target: '성과', // 임의 타겟
        value: randomFloat(1000, 10000),
      };

      const ref = db.collection('company_metrics').doc();
      await ref.set(data);
    }

    console.log(`📅 ${dayStr} - 부서 ${departments.length}개 데이터 추가 완료`);
  }

  console.log('✅ 모든 회사 성과 데이터 삽입 완료!');
}

seedCompanyMetrics();
