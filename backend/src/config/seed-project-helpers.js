const admin = require('firebase-admin');
const dayjs = require('dayjs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// 공통 설정
const projectIds = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
const steps = ['기획', '디자인', '개발', '테스트', '배포'];
const statuses = ['completed', 'in_progress', 'delayed', 'pending'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

// ─────────────────────────────────────────
// 1. project_simulations - 몬테카를로 시뮬레이션 데이터
async function seedProjectSimulations() {
  for (const projectId of projectIds) {
    // 시뮬레이션 날짜 (100회 시뮬레이션)
    const sim_dates = Array.from({ length: 100 }, () =>
      dayjs('2025-01-01').add(randomInt(15, 45), 'day').toDate()
    );

    // 단계별 지연 데이터
    const step_delays = steps.map(step => ({
      step,
      delays: Array.from({ length: 50 }, () => randomInt(0, 120)), // 0-120분 지연
      avg_delay: randomInt(10, 60),
      max_delay: randomInt(60, 180),
      min_delay: 0,
    }));

    // 리스크 분석 데이터
    const risk_analysis = {
      completion_probability: randomFloat(0.7, 0.95, 2),
      expected_completion_date: dayjs('2025-01-01').add(randomInt(20, 40), 'day').toDate(),
      confidence_interval: {
        lower: dayjs('2025-01-01').add(randomInt(15, 35), 'day').toDate(),
        upper: dayjs('2025-01-01').add(randomInt(25, 50), 'day').toDate(),
      }
    };

    await db.collection('project_simulations').add({
      project_id: projectId,
      sim_dates,
      step_delays,
      risk_analysis,
      simulation_count: 100,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    });

    console.log(`✅ ${projectId} - project_simulations 완료`);
  }
}

// ─────────────────────────────────────────
// 2. project_progress - 진행률 추적 데이터
async function seedProjectProgress() {
  for (const projectId of projectIds) {
    const time = [];
    const pct_complete = [];
    const milestone_achievements = [];
    const resource_utilization = [];

    for (let i = 0; i < 30; i++) {
      const date = dayjs('2025-01-01').add(i, 'day');
      time.push(date.toDate());
      
      // 진행률 (S자 곡선 형태)
      const progress = Math.min(100, Math.max(0, 
        (i / 30) * 100 + randomInt(-5, 5)
      ));
      pct_complete.push(progress);
      
      // 마일스톤 달성 여부
      milestone_achievements.push({
        date: date.toDate(),
        milestone: i % 5 === 0 ? steps[Math.floor(i / 5)] : null,
        achieved: i % 5 === 0 ? randomInt(0, 1) === 1 : false,
      });
      
      // 자원 활용률 (70-95%)
      resource_utilization.push(randomFloat(0.7, 0.95, 2));
    }

    await db.collection('project_progress').add({
      project_id: projectId,
      time,
      pct_complete,
      milestone_achievements,
      resource_utilization,
      total_duration: 30,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    });

    console.log(`✅ ${projectId} - project_progress 완료`);
  }
}

// ─────────────────────────────────────────
// 3. project_costs - 비용 관리 데이터
async function seedProjectCosts() {
  for (const projectId of projectIds) {
    const time = [];
    const cum_cost = [];
    const daily_cost = [];
    const budget_variance = [];
    const cost_breakdown = [];

    let cost = 0;
    let totalBudget = randomInt(50000000, 200000000); // 5천만원-2억원
    let plannedDailyCost = totalBudget / 30;

    for (let i = 0; i < 30; i++) {
      const date = dayjs('2025-01-01').add(i, 'day');
      time.push(date.toDate());
      
      const dailyVariation = randomFloat(0.8, 1.2, 2);
      const currentDailyCost = Math.floor(plannedDailyCost * dailyVariation);
      daily_cost.push(currentDailyCost);
      
      cost += currentDailyCost;
      cum_cost.push(cost);
      
      budget_variance.push(randomFloat(-15, 15, 1));
      
      // 비용 세부 내역
      cost_breakdown.push({
        date: date.toDate(),
        labor_cost: Math.floor(currentDailyCost * 0.6),
        material_cost: Math.floor(currentDailyCost * 0.25),
        overhead_cost: Math.floor(currentDailyCost * 0.15),
      });
    }

    await db.collection('project_costs').add({
      project_id: projectId,
      time,
      cum_cost,
      daily_cost,
      budget_variance,
      cost_breakdown,
      total_budget: totalBudget,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    });

    console.log(`✅ ${projectId} - project_costs 완료`);
  }
}

// ─────────────────────────────────────────
// 4. project_dependencies - 의존성 관리 데이터
async function seedProjectDependencies() {
  for (const projectId of projectIds) {
    // 기본 순차 의존성
    for (let i = 0; i < steps.length - 1; i++) {
      await db.collection('project_dependencies').add({
        project_id: projectId,
        from: steps[i],
        to: steps[i + 1],
        planned_duration: randomInt(240, 480),
        actual_duration: randomInt(200, 520),
        dependency_type: 'FS',
        lag: randomInt(0, 60),
        critical_path: i === 0 || i === steps.length - 2,
        risk_level: randomInt(1, 5),
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now(),
      });

      console.log(`🔗 ${projectId} - ${steps[i]} → ${steps[i + 1]} 의존성 추가`);
    }

    // 크로스 의존성
    const crossDeps = [
      { from: '기획', to: '개발', type: 'SS' },
      { from: '디자인', to: '테스트', type: 'FF' },
    ];

    for (const dep of crossDeps) {
      await db.collection('project_dependencies').add({
        project_id: projectId,
        from: dep.from,
        to: dep.to,
        planned_duration: randomInt(120, 360),
        actual_duration: randomInt(100, 400),
        dependency_type: dep.type,
        lag: randomInt(0, 30),
        critical_path: false,
        risk_level: randomInt(2, 4),
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now(),
      });

      console.log(`🔗 ${projectId} - ${dep.from} → ${dep.to} (${dep.type}) 크로스 의존성 추가`);
    }
  }

  console.log('✅ project_dependencies 완료');
}

// ─────────────────────────────────────────
// 5. project_tasks - 작업 관리 데이터
async function seedProjectTasks() {
  for (const projectId of projectIds) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const plannedStart = dayjs('2025-01-01').add(i * 5, 'day');
      const plannedDuration = randomInt(240, 480);
      const actualDuration = plannedDuration + randomInt(-60, 60);
      const delta = actualDuration - plannedDuration;

      await db.collection('project_tasks').add({
        project_id: projectId,
        task_name: `${step} 단계`,
        step: step,
        status: statuses[randomInt(0, statuses.length - 1)],
        planned_start: admin.firestore.Timestamp.fromDate(plannedStart.toDate()),
        planned_end: admin.firestore.Timestamp.fromDate(plannedStart.add(plannedDuration, 'minute').toDate()),
        actual_start: admin.firestore.Timestamp.fromDate(plannedStart.add(randomInt(-30, 30), 'minute').toDate()),
        actual_end: admin.firestore.Timestamp.fromDate(plannedStart.add(actualDuration, 'minute').toDate()),
        planned_duration: plannedDuration,
        actual_duration: actualDuration,
        delta: delta,
        progress: randomInt(0, 100),
        assignee: `user_${String(i + 1).padStart(3, '0')}`,
        priority: randomInt(1, 5),
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now(),
      });

      console.log(`✅ ${projectId} - ${step} 작업 추가 완료`);
    }
  }

  console.log('✅ project_tasks 완료');
}

// ─────────────────────────────────────────
// 실행 함수
async function runAllSeeds() {
  console.log('\n🚀 프로젝트 분석 데이터 시드 시작');
  console.log('=' * 50);
  
  try {
    await seedProjectSimulations();
    await seedProjectProgress();
    await seedProjectCosts();
    await seedProjectDependencies();
    await seedProjectTasks();
    
    console.log('=' * 50);
    console.log('🎉 모든 프로젝트 분석 데이터 시드 완료!');
  } catch (error) {
    console.error('❌ 시드 실행 중 오류 발생:', error);
  }
}

runAllSeeds();
