'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import GanttChart from './GanttChart';
import PertNetworkChart from './PertNetworkChart';

// ForceGraph2D를 동적 import로 변경하여 SSR 오류 방지
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">네트워크 그래프 로딩 중...</div>
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// ProjectScheduleAnalysis 스키마에 맞는 인터페이스
interface ProjectScheduleAnalysis {
  project_id: string;                           // 프로젝트 ID
  date: string;                                 // 분석 날짜
  task_list: string[];                          // 작업 리스트
  start_dates: Record<string, string>;          // 시작일 리스트
  durations: Record<string, number>;            // 단계별 기간
  dependencies: Record<string, string[]>;       // 작업 간 종속 관계
  planned_completion_dates: Record<string, string>; // 계획 완료일 리스트
  actual_completion_dates: Record<string, string>;  // 실제 완료일 리스트
  simulation_completion_dates: string[];        // 완료일 시뮬레이션
  progress: Record<string, number>;             // 단계별 진행률
  delay_times: Record<string, number>;          // 단계별 지연 시간
  intervals: Record<string, number>;            // 단계 간 간격
  cumulative_budget: Record<string, number>;    // 예산 누적 소모
  stage_status: Record<string, string>;         // 단계별 상태 (완료, 진행, 지연)
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
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectScheduleAnalysis[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/projectTasks')
      .then(res => res.json())
      .then((data: ProjectScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setProjectAnalysis(analysisArray);
      })
      .catch(console.error);
  }, []);

  // 첫 번째 분석 데이터 가져오기 (가장 최근 데이터)
  const firstData = useMemo(() => {
    if (!Array.isArray(projectAnalysis) || projectAnalysis.length === 0) {
      return null;
    }
    return projectAnalysis[0];
  }, [projectAnalysis]);

  //1. 간트차트 데이터 생성
  const ganttData = useMemo(() => {
    if (!firstData || !firstData.task_list || !firstData.start_dates || !firstData.durations) {
      return ganttProjects[0];
    }

    const tasks = firstData.task_list.map((task, index) => {
      const startDate = firstData.start_dates[task];
      const duration = firstData.durations[task] || 1;
      const start = startDate ? dayjs(startDate).diff(dayjs(firstData.start_dates[firstData.task_list[0]]), 'day') : index;
      const end = start + duration;
      
      return {
        name: task,
        start,
        end,
        color: ['#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f87171'][index % 5],
      };
    });

    const totalDays = Math.max(...tasks.map(t => t.end));

    return {
      id: firstData.project_id,
      name: `프로젝트 ${firstData.project_id}`,
      tasks,
      totalDays,
    };
  }, [firstData]);

  //2. PERT 네트워크 데이터
  const pertData = useMemo(() => {
    if (!firstData || !firstData.dependencies) {
      return { nodes: [], links: [] };
    }

    const nodes = new Set<string>();
    const edges: { from: string; to: string; duration: number }[] = [];

    Object.entries(firstData.dependencies).forEach(([task, dependencies]) => {
      nodes.add(task);
      
      if (Array.isArray(dependencies)) {
        dependencies.forEach(dep => {
          nodes.add(dep);
          const duration = firstData.durations?.[task] || 1;
          edges.push({ from: dep, to: task, duration });
        });
      }
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id })),
      links: edges.map(e => ({ source: e.from, target: e.to, label: String(e.duration) })),
    };
  }, [firstData]);

  //3. 단계별 지연 시간 (워터폴 차트)
  const delayData = useMemo(() => {
    if (!firstData || !firstData.delay_times) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.delay_times);
    const data = Object.values(firstData.delay_times);

    return { labels, data };
  }, [firstData]);

  //4. 시뮬레이션 완료일 분포 (히스토그램)
  const simulationData = useMemo(() => {
    if (!firstData || !firstData.simulation_completion_dates) {
      return { labels: [], data: [] };
    }

    const dates = firstData.simulation_completion_dates;
    const dateCount: Record<string, number> = {};
    
    dates.forEach(dateStr => {
      const d = dayjs(dateStr).format('M/D');
      dateCount[d] = (dateCount[d] || 0) + 1;
    });

    const labels = Object.keys(dateCount).sort();
    const data = labels.map(d => dateCount[d]);

    return { labels, data };
  }, [firstData]);

  //5. 단계별 진행률 (라인차트)
  const progressData = useMemo(() => {
    if (!firstData || !firstData.progress) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.progress);
    const data = Object.values(firstData.progress);

    return { labels, data };
  }, [firstData]);

  //6. 단계별 상태 분포 (파이차트)
  const statusData = useMemo(() => {
    if (!firstData || !firstData.stage_status) {
      return { labels: [], data: [] };
    }

    const statusCounts: Record<string, number> = {};
    Object.values(firstData.stage_status).forEach(status => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    return { labels, data };
  }, [firstData]);

  //7. 단계 간 간격 (산점도)
  const intervalData = useMemo(() => {
    if (!firstData || !firstData.intervals) {
      return { datasets: [] };
    }

    const intervals = Object.entries(firstData.intervals);
    const data = intervals.map(([task, interval], index) => ({
      x: index + 1,
      y: interval,
    }));

    return {
      datasets: [
        {
          label: '단계 간 간격',
          data,
          backgroundColor: '#3b82f6',
          pointRadius: 6,
        },
      ],
    };
  }, [firstData]);

  //8. 예산 누적 소모 (면적차트)
  const budgetData = useMemo(() => {
    if (!firstData || !firstData.cumulative_budget) {
      return { labels: [], data: [] };
    }

    const labels = Object.keys(firstData.cumulative_budget).sort();
    const data = labels.map(task => firstData.cumulative_budget[task]);

    return { labels, data };
  }, [firstData]);

  //9. 계획 vs 실제 완료일 비교 (막대그래프)
  const completionComparison = useMemo(() => {
    if (!firstData || !firstData.planned_completion_dates || !firstData.actual_completion_dates) {
      return { labels: [], planned: [], actual: [] };
    }

    const tasks = Object.keys(firstData.planned_completion_dates);
    const planned = tasks.map(task => {
      const date = firstData.planned_completion_dates[task];
      return date ? dayjs(date).diff(dayjs(firstData.start_dates[task] || firstData.date), 'day') : 0;
    });
    const actual = tasks.map(task => {
      const date = firstData.actual_completion_dates[task];
      return date ? dayjs(date).diff(dayjs(firstData.start_dates[task] || firstData.date), 'day') : 0;
    });

    return { labels: tasks, planned, actual };
  }, [firstData]);

  return (
    <>
      {/* 3x3 그리드: 9개 프로젝트 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* 1. 간트차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b] flex items-center justify-between">
            <span>간트 차트</span>
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
            <GanttChart project={ganttData} />
          </div>
        </div>

        {/* 2. PERT 네트워크 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">PERT 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <ForceGraph2D
              graphData={pertData}
              nodeLabel={(node: any) => node.id}
              nodeAutoColorBy="group"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={250}
              height={250}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#22223b';
                ctx.fillText(label, node.x, node.y + 8);
              }}
            />
          </div>
        </div>

        {/* 3. 단계별 지연 시간 (워터폴) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연 시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: delayData.labels,
                datasets: [{
                  label: '지연 시간(일)',
                  data: delayData.data,
                  backgroundColor: delayData.data.map(val => 
                    val > 0 ? '#f87171' : val < 0 ? '#34d399' : '#e5e7eb'
                  ),
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { title: { display: true, text: '지연 시간(일)' } } },
              }}
            />
          </div>
        </div>

        {/* 4. 시뮬레이션 완료일 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">완료일 시뮬레이션 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: simulationData.labels,
                datasets: [{
                  label: '건수',
                  data: simulationData.data,
                  backgroundColor: '#818cf8',
                  borderRadius: 8,
                  barPercentage: 0.8,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
              }}
            />
          </div>
        </div>

        {/* 5. 단계별 진행률 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 진행률</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: progressData.labels,
                datasets: [{
                  label: '진행률(%)',
                  data: progressData.data,
                  backgroundColor: '#3b82f6',
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100, title: { display: true, text: '진행률(%)' } } },
              }}
            />
          </div>
        </div>

        {/* 6. 단계별 상태 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 상태 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={{
                labels: statusData.labels,
                datasets: [{
                  label: '상태',
                  data: statusData.data,
                  backgroundColor: ['#22c55e', '#6366f1', '#f87171', '#f59e0b'],
                }],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 7. 단계 간 간격 (산점도) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">단계 간 간격</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={intervalData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: '단계 순서' } },
                  y: { title: { display: true, text: '간격(일)' } },
                },
              }}
            />
          </div>
        </div>

        {/* 8. 예산 누적 소모 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">예산 누적 소모</div>
          <div className="flex-1 flex items-center">
            <Line
              data={{
                labels: budgetData.labels,
                datasets: [{
                  label: '누적 예산(만원)',
                  data: budgetData.data,
                  borderColor: '#f59e42',
                  backgroundColor: '#f59e4222',
                  fill: true,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#f59e42',
                  pointRadius: 4,
                  tension: 0.35,
                  borderWidth: 2,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '누적 예산(만원)' } } },
              }}
            />
          </div>
        </div>

        {/* 9. 계획 vs 실제 완료일 비교 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">계획 vs 실제 완료일</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: completionComparison.labels,
                datasets: [
                  {
                    label: '계획',
                    data: completionComparison.planned,
                    backgroundColor: '#3b82f6',
                  },
                  {
                    label: '실제',
                    data: completionComparison.actual,
                    backgroundColor: '#f59e0b',
                  },
                ],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '소요일수' } } },
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
} 