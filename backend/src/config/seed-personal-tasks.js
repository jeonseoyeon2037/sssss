const admin = require('firebase-admin');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const userId = 'user_001';
const startDate = dayjs('2024-06-01');
const days = 7;

const statuses = ['completed', 'late', 'not_done'];
const tags = ['업무', '회의', '개인', '기타'];

async function seedData() {
  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD');
    const totalTasks = 10;
    const completedTasks = 7 + Math.floor(Math.random() * 4); // 7~10개
    const remainingTasks = totalTasks - completedTasks;

    const tasks = [];

    // 완료된 일정 생성
    for (let j = 0; j < completedTasks; j++) {
      tasks.push({
        user_id: userId,
        date: date,
        start_time: admin.firestore.Timestamp.fromDate(new Date(`${date}T09:${j}0:00`)),
        end_time: admin.firestore.Timestamp.fromDate(new Date(`${date}T09:${j}5:00`)),
        status: 'completed',
        tag: tags[Math.floor(Math.random() * tags.length)],
        duration: 50 + Math.floor(Math.random() * 20),
        emotion: Math.floor(Math.random() * 3) + 3, // 3~5
      });
    }

    // 미완료 일정 생성
    for (let j = 0; j < remainingTasks; j++) {
      const status = statuses[Math.floor(Math.random() * 2) + 1]; // late or not_done
      tasks.push({
        user_id: userId,
        date: date,
        start_time: admin.firestore.Timestamp.fromDate(new Date(`${date}T10:${j}0:00`)),
        end_time: admin.firestore.Timestamp.fromDate(new Date(`${date}T10:${j}5:00`)),
        status,
        tag: tags[Math.floor(Math.random() * tags.length)],
        duration: 30 + Math.floor(Math.random() * 20),
        emotion: Math.floor(Math.random() * 5) + 1, // 1~5
      });
    }

    // Firestore에 삽입
    for (const task of tasks) {
      const ref = db.collection('personal_tasks').doc();
      await ref.set(task);
    }

    console.log(`📅 ${date} - ${totalTasks}건 추가 완료`);
  }

  console.log('✅ 모든 더미 데이터 삽입 완료!');
}

seedData();
