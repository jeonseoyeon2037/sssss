const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const projectId = 'project_001'; // 실제 프로젝트 ID로 교체 필요
const baseDate = dayjs('2024-06-01');
const statuses = ['completed', 'in_progress', 'delayed'];
const steps = ['기획', '디자인', '개발', '테스트', '배포'];

async function seedProjectTasks() {
  for (let i = 0; i < steps.length; i++) {
    const taskName = `${steps[i]} 단계`;
    const plannedStart = baseDate.add(i * 2, 'day');
    const plannedDuration = 240 + Math.floor(Math.random() * 60); // 4~5시간
    const plannedEnd = plannedStart.add(plannedDuration, 'minute');

    const lag = Math.floor(Math.random() * 60); // 단계 간 지연 (0~59분)

    // 실제 시간 오차 고려
    const actualStart = plannedStart.add(Math.floor(Math.random() * 30), 'minute');
    const actualDuration = plannedDuration + Math.floor(Math.random() * 60) - 30; // -30~+30분 차이
    const actualEnd = actualStart.add(actualDuration, 'minute');
    const delta = actualDuration - plannedDuration;

    const task = {
      project_id: projectId,
      task_name: taskName,
      planned_start: admin.firestore.Timestamp.fromDate(plannedStart.toDate()),
      planned_end: admin.firestore.Timestamp.fromDate(plannedEnd.toDate()),
      actual_start: admin.firestore.Timestamp.fromDate(actualStart.toDate()),
      actual_end: admin.firestore.Timestamp.fromDate(actualEnd.toDate()),
      planned_duration: plannedDuration,
      actual_duration: actualDuration,
      delta,
      step: steps[i],
      lag,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };

    const ref = db.collection('project_tasks').doc();
    await ref.set(task);
    console.log(`✅ ${taskName} 추가 완료`);
  }

  console.log('🎯 모든 project_tasks 더미 데이터 삽입 완료!');
}

seedProjectTasks();
