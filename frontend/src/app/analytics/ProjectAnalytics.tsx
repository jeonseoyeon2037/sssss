'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import ForceGraph2D from 'react-force-graph-2d';
import GanttChart from './GanttChart';
import PertNetworkChart from './PertNetworkChart';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);


export interface ProjectTask {
  id: string;              // 업무 ID
  project_id: string;      // 프로젝트 ID
  name: string;            // 업무명
  assignee: string;        // 담당자
  type: string;            // 업무유형(예: 개발, 기획 등)
  status: string;          // 상태(진행중, 완료 등)
  start_date: string;      // 시작일(YYYY-MM-DD 등)
  end_date: string;        // 종료일(YYYY-MM-DD 등)
  duration: number;        // 소요시간(분 또는 시간)
  progress: number;        // 진행률(%)
  output?: string;         // 산출물/결과(선택)
  dependency?: string[];   // 의존업무ID 배열(선택)
  created_at?: Date;       // 생성일시(선택)
  updated_at?: Date;       // 수정일시(선택)
}

const ganttProjects = [
  {
    id: 'p1',
    name: 'CRM 시스템 구축',
    tasks: [
      { name: '기획', start: 0, end: 3, color: '#60a5fa' },
      { name: '설계', start: 3, end: 6, color: '#fbbf24' },
      { name: '개발', start: 6, end: 13, color: '#34d399' },
      { name: '테스트', start: 13, end: 15, color: '#a78bfa' },
      { name: '배포', start: 15, end: 16, color: '#f87171' },
    ],
    totalDays: 16,
  },
  {
    id: 'p2',
    name: '모바일 앱 리뉴얼',
    tasks: [
      { name: '기획', start: 0, end: 2, color: '#60a5fa' },
      { name: '설계', start: 2, end: 5, color: '#fbbf24' },
      { name: '개발', start: 5, end: 10, color: '#34d399' },
      { name: '테스트', start: 10, end: 13, color: '#a78bfa' },
      { name: '배포', start: 13, end: 14, color: '#f87171' },
    ],
    totalDays: 14,
  },
  {
    id: 'p3',
    name: 'ERP 고도화',
    tasks: [
      { name: '기획', start: 0, end: 2, color: '#60a5fa' },
      { name: '설계', start: 2, end: 4, color: '#fbbf24' },
      { name: '개발', start: 4, end: 8, color: '#34d399' },
      { name: '테스트', start: 8, end: 10, color: '#a78bfa' },
      { name: '배포', start: 10, end: 11, color: '#f87171' },
    ],
    totalDays: 11,
  },
];

export default function ProjectAnalytics() {
  const [selectedProjectId, setSelectedProjectId] = useState(ganttProjects[0].id);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectDependencies, setProjectDependencies] = useState<any[]>([]);
  const [projectSimulations, setProjectSimulations] = useState<any[]>([]);
  const [projectProgress, setProjectProgress] = useState<any[]>([]);
  const [projectCosts, setProjectCosts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/project-tasks')
      .then(res => res.json())
      .then((data: ProjectTask[]) => setProjectTasks(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/project-dependencies')
      .then(res => res.json())
      .then((data: any[]) => setProjectDependencies(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/project-simulations')
      .then(res => res.json())
      .then((data: any[]) => setProjectSimulations(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/project-progress')
      .then(res => res.json())
      .then((data: any[]) => setProjectProgress(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/project-costs')
      .then(res => res.json())
      .then((data: any[]) => setProjectCosts(data))
      .catch(console.error);
  }, []);

  //2. PERT 네트워크
  // 예시 project_dependencies 데이터
  const pertEdges = projectDependencies.map((row: any) => ({
    source: row.from,
    target: row.to,
    label: String(row.planned_duration),
  }));

  // 노드 색상 맵(이미지 스타일 참고)
  const nodeColors: Record<string, string> = {
    '영업': '#38bdf8', 'CS': '#0ea5e9', '배포': '#f87171',
    'QA': '#a78bfa', '기획': '#fbbf24', '개발': '#34d399',
    '테스트': '#a78bfa', '디자인': '#a78bfa'
  };

  const pertNodes = Array.from(
    new Set([
      ...projectDependencies.map((row: any) => row.from),
      ...projectDependencies.map((row: any) => row.to),
    ])
  ).map((id: string) => ({
    id,
    color: nodeColors[id] || '#888',
    size: 800,
    fontColor: nodeColors[id] || '#888',
  }));

  // PERT 차트용 팀 데이터 생성
  const pertTeams = Array.from(
    new Set([
      ...projectDependencies.map((row: any) => row.from),
      ...projectDependencies.map((row: any) => row.to),
    ])
  ).map((teamName: string) => ({
    label: teamName,
    color: nodeColors[teamName] || '#888'
  }));

  // 3. 단계별 지연 워터폴
  const stepList_3 = projectTasks.map((t: any) => t.task_name);

  const deltaData = projectTasks.map((t: any) =>
    (typeof t.delta === 'number')
      ? t.delta
      : (typeof t.actual_duration === 'number' && typeof t.planned_duration === 'number')
        ? t.actual_duration - t.planned_duration
        : 0
  );

  // 이미지 스타일 참고 색상 (빨강/초록/주황/연두)
  const barColors = deltaData.map(val =>
    val > 0
      ? (val > 2 ? '#fbbf24' : '#f87171')  // 오렌지(2↑), 빨강(0~2)
      : (val < 0 ? (val < -1 ? '#a3e635' : '#34d399') : '#e5e7eb') // 연두(-1↓), 초록(-1~0), 회색(0)
  );

  // 4. 몬테카 히스토그램
  // projectSimulations: [{ sim_dates: string[] }]
  const allDates: string[] = projectSimulations.flatMap(
    (row: any) => Array.isArray(row.sim_dates) ? row.sim_dates : [row.sim_dates]
  );

  // 최근 10일(예시), 원하면 기간 조정
  const days = Array.from({ length: 10 }, (_, i) =>
    dayjs().subtract(9 - i, 'day').format('M/D')
  );

  const dateCount: Record<string, number> = {};
  allDates.forEach(dateStr => {
    const d = dayjs(dateStr).format('M/D');
    dateCount[d] = (dateCount[d] || 0) + 1;
  });

  // x축 날짜, y축 count
  const histogramData = {
    labels: days,
    datasets: [
      {
        label: '건수',
        data: days.map(d => dateCount[d] || 0),
        backgroundColor: '#818cf8',
        borderRadius: 8,
        barPercentage: 0.8,
      }
    ]
  };

  // 5. 단계 진행률 라인차트
  const sortedProgress = [...projectProgress]
    .filter((row: any) => typeof row.pct_complete === 'number' && row.time)
    .sort((a, b) => dayjs(a.time).unix() - dayjs(b.time).unix());

  const labels_5 = sortedProgress.map(row =>
    dayjs(row.time).format('M/D')
  );
  const data_5 = sortedProgress.map(row => row.pct_complete);

  const progressLineData = {
    labels: labels_5,
    datasets: [
      {
        label: '진행률(%)',
        data: data_5,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f622',
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointRadius: 4,
        tension: 0.35,
        borderWidth: 2,
      }
    ]
  };

  // 6. 리스크 박스플롯 (바형태로 대체)
  const stepList_6 = Array.from(new Set(projectSimulations.map((row: any) => row.step)));

  const delayStats = stepList_6.map(step => {
    debugger;
    const delays = projectSimulations
      .filter((row: any) => row.step === step && typeof row.delay === 'number')
      .map((row: any) => row.delay);

    const min = delays.length ? Math.min(...delays) : 0;
    const avg = delays.length ? (delays.reduce((a, b) => a + b, 0) / delays.length) : 0;
    const max = delays.length ? Math.max(...delays) : 0;

    return { min, avg, max };
  });

  const riskBarData = {
    labels: stepList_6,
    datasets: [
      {
        label: '최소',
        data: delayStats.map(stat => stat.min),
        backgroundColor: '#c7d2fe', // 연한 파랑
      },
      {
        label: '평균',
        data: delayStats.map(stat => stat.avg),
        backgroundColor: '#60a5fa', // 중간 파랑
      },
      {
        label: '최대',
        data: delayStats.map(stat => stat.max),
        backgroundColor: '#1e40af', // 진한 파랑
      },
    ],
  };

  // 7. 완료대기 산점도
  const stepList = Array.from(new Set(projectTasks.map((row: any) => row.step)));

  const colorMap: Record<string, string> = {
    '기획': '#3b82f6',
    '설계': '#22c55e',
    '개발': '#f59e42',
    // 필요시 추가
  };

  // step별로 데이터 분리 (chartjs scatter는 datasets별로 색상분리됨)
  const scatterDatasets = stepList.map((step, i) => ({
    label: step,
    data: projectTasks
      .filter((row: any) => row.step === step && typeof row.lag === 'number')
      .map((row: any) => ({
        x: i + 1,     // 1, 2, 3, ...
        y: row.lag,
      })),
    backgroundColor: colorMap[step] || '#888',
    pointRadius: 2,
  }));

  // 8. 예산 vs 일정 면적차트
  const sortedCosts = [...projectCosts]
    .filter((row: any) => typeof row.cum_cost === 'number' && row.time)
    .sort((a, b) => dayjs(a.time).unix() - dayjs(b.time).unix());

  const labels = sortedCosts.map(row =>
    dayjs(row.time).format('M/D')
  );
  const data = sortedCosts.map(row => row.cum_cost);

  const costAreaData = {
    labels,
    datasets: [
      {
        label: '누적 예산(만원)',
        data,
        borderColor: '#f59e42',         // 오렌지
        backgroundColor: '#f59e4222',   // 연오렌지(투명)
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f59e42',
        pointRadius: 4,
        tension: 0.35,
        borderWidth: 2,
      }
    ]
  };
  
  // 9. 단계 상태 파이차트
  const statusLabels = ['completed', 'in_progress', 'delayed'];
  const colorMap_9: Record<string, string> = {
    'completed': '#22c55e',   // 초록
    'in_progress': '#6366f1', // 파랑
    'delayed': '#f87171',     // 빨강
  };

  const statusCounts: Record<string, number> = {};
  projectTasks.forEach((row: any) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  });

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        label: '단계 상태',
        data: statusLabels.map(l => statusCounts[l] || 0),
        backgroundColor: statusLabels.map(l => colorMap_9[l] || '#888'),
        borderWidth: 0,
      }
    ]
  };

  return (
    <>
      {/* 3x3 그리드: 9개 프로젝트 일정 분석 차트 (회사탭) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* 1. 간트차트 (프로젝트 선택 + 전문 Gantt) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b] flex items-center justify-between">
            <span>간트 차트</span>
            {/* 프로젝트 셀렉트 박스 */}
            <select
              className="ml-4 border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              {ganttProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* 전문 Gantt Chart */}
            <GanttChart project={ganttProjects.find(p => p.id === selectedProjectId) || ganttProjects[0]} />
          </div>
        </div>

        {/* 2. PERT 네트워크 (SVG 네트워크 차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[220px]">
          <div className="font-semibold mb-3 text-[#22223b]">PERT 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <PertNetworkChart teams={pertTeams} dependencies={projectDependencies} />
          </div>
        </div>

        {/* 3. 단계별 지연 워터폴 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연(워터폴)</div>
          <Bar
            data={{
              labels: stepList,
              datasets: [{
                label: '지연(일)',
                data: deltaData,
                backgroundColor: barColors,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { title: { display: true, text: '지연(일)' } } },
            }}
          />
        </div>

        {/* 4. 몬테카 히스토그램 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">완료일 분포(몬테카)</div>
          <Bar
            data={histogramData}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
            }}
          />
        </div>

        {/* 5. 단계 진행률 라인차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">단계 진행률</div>
          <Line
            data={progressLineData}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { min: 0, max: 100, title: { display: true, text: '진행률(%)' } } },
            }}
          />
        </div>

        {/* 6. 리스크 박스플롯 (바형태로 대체) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">리스크 분포</div>
          <Bar
            data={riskBarData}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '지연(일)' } } },
            }}
          />
        </div>

        {/* 7. 완료대기 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">완료-대기 산점도</div>
          <Scatter
            data={{
              datasets: scatterDatasets
            }}
            options={{
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: '선행 단계' } },
                y: { title: { display: true, text: '후행 단계 대기(일)' } },
              },
            }}
          />
        </div>

        {/* 8. 예산 vs 일정 면적차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">예산 vs 일정</div>
          <Line
            data={costAreaData}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '누적 예산(만원)' } } },
            }}
          />
        </div>

        {/* 9. 단계 상태 파이차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">단계 상태 비율</div>
          <div className="w-[270px] h-[270px] flex justify-center">
            <Pie
              data={pieData}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
} 