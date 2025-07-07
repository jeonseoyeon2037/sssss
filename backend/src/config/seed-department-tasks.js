const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const departments = ['스마트앱개발팀', 'AI팀', '디자인팀'];
const assignees = ['user_001', 'user_002', 'user_003']; // 실제 사용자 ID로 교체 필요
const types = ['meeting', 'development', 'review'];
const startDate = dayjs('2024-06-01');
const days = 7;

async function seedDepartmentTasks() {
  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day');
    const dayStr = date.format('YYYY-MM-DD');
    const monthStr = date.format('YYYY-MM');

    for (let j = 0; j < 10; j++) {
      const assignee = assignees[j % assignees.length];
      const department = departments[j % departments.length];
      const assignedTime = date.hour(9).minute(j).toDate();
      const startTime = dayjs(assignedTime).add(5, 'minute').toDate();

      const delay = Math.floor(Math.random() * 30); // 0~29분
      const hours = 60 + Math.floor(Math.random() * 60); // 60~119분
      const duration = hours - Math.floor(Math.random() * 20); // 실제 수행시간
      const quality = Math.floor(Math.random() * 5) + 1; // 1~5
      const late = delay > 10 ? 1 : 0;

      const task = {
        department,
        assignee,
        type: types[Math.floor(Math.random() * types.length)],
        assigned_time: admin.firestore.Timestamp.fromDate(assignedTime),
        start_time: admin.firestore.Timestamp.fromDate(startTime),
        delay,
        hours,
        duration,
        quality,
        participant_ids: assignees.filter(id => id !== assignee),
        month: monthStr,
        late,
      };

      const ref = db.collection('department_tasks').doc();
      await ref.set(task);
    }

    console.log(`📅 ${dayStr} - 10건 추가 완료`);
  }

  console.log('✅ 모든 부서 일정 더미 데이터 삽입 완료!');
}

seedDepartmentTasks();
