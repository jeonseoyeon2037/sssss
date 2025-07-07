const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// 1. personal_tasks 컬렉션 스키마용 더미 문서
async function initPersonalTasks() {
  await db.collection('personal_tasks').doc('_schema').set({
    user_id: '',
    date: '', // YYYY-MM-DD
    start_time: null,
    end_time: null,
    status: '',
    tag: '',
    duration: 0,
    emotion: 0,
  });
  console.log('✅ personal_tasks 초기화 완료');
}

// 2. department_tasks 컬렉션 스키마용 더미 문서
async function initDepartmentTasks() {
  await db.collection('department_tasks').doc('_schema').set({
    department: '',
    assignee: '',
    type: '',
    assigned_time: null,
    start_time: null,
    delay: 0,
    hours: 0,
    duration: 0,
    quality: 0,
    participant_ids: [],
    month: '',
    late: 0,
  });
  console.log('✅ department_tasks 초기화 완료');
}

// 3. company_metrics 컬렉션 스키마용 더미 문서
async function initCompanyMetrics() {
  await db.collection('company_metrics').doc('_schema').set({
    department: '',
    date: null,
    month: '',
    hours: 0,
    revenue: 0,
    prod: 0,
    fatigue: 0,
    CS_count: 0,
    ROI: 0,
    source: '',
    target: '',
    value: 0,
  });
  console.log('✅ company_metrics 초기화 완료');
}

// 4. project_tasks 컬렉션 스키마용 더미 문서
async function initProjectTasks() {
  await db.collection('project_tasks').doc('_schema').set({
    project_id: '',
    task_name: '',
    planned_start: null,
    planned_end: null,
    actual_start: null,
    actual_end: null,
    planned_duration: 0,
    actual_duration: 0,
    delta: 0,
    step: '',
    lag: 0,
    status: '',
  });
  console.log('✅ project_tasks 초기화 완료');
}

// 실행
async function initAllSchemas() {
  console.log('\n🚀 컬렉션 스키마 초기화 시작...');
  await initPersonalTasks();
  await initDepartmentTasks();
  await initCompanyMetrics();
  await initProjectTasks();
  console.log('\n🎉 모든 컬렉션 _schema 문서 삽입 완료!');
}

initAllSchemas();
