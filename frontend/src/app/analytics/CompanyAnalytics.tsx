import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import SankeyDiagram from './SankeyDiagram';
import GanttChart from './GanttChart';
import PertNetworkChart from './PertNetworkChart';
import { useState } from 'react';

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

export default function CompanyAnalytics() {
  const [selectedProjectId, setSelectedProjectId] = useState(ganttProjects[0].id);
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
            <PertNetworkChart />
          </div>
        </div>
        {/* 3. 단계별 지연 워터폴 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">단계별 지연(워터폴)</div>
          <Bar
            data={{
              labels: ['기획','설계','개발','테스트','배포'],
              datasets: [{
                label: '지연(일)',
                data: [2, -1, 3, 0, -2],
                backgroundColor: ['#f87171','#10b981','#f59e42','#6366f1','#a3e635'],
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
            data={{
              labels: Array.from({length: 10}, (_,i) => `6/${10+i}`),
              datasets: [{
                label: '완료 건수',
                data: [1, 2, 5, 8, 12, 10, 7, 4, 2, 1],
                backgroundColor: '#6366f1',
              }],
            }}
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
            data={{
              labels: ['6/1','6/5','6/10','6/15','6/20','6/25','6/30'],
              datasets: [{
                label: '진행률(%)',
                data: [10, 30, 45, 60, 75, 90, 100],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.4,
              }],
            }}
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
            data={{
              labels: ['기획','설계','개발','테스트','배포'],
              datasets: [
                { label: '최소', data: [0,1,2,1,0], backgroundColor:'#dbeafe' },
                { label: '평균', data: [2,3,4,3,2], backgroundColor:'#3b82f6' },
                { label: '최대', data: [5,6,7,6,5], backgroundColor:'#1e40af' },
              ]
            }}
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
              datasets: [
                { label: '기획', data: [ {x:1,y:2},{x:2,y:1} ], backgroundColor:'#3b82f6' },
                { label: '설계', data: [ {x:1,y:3},{x:2,y:2} ], backgroundColor:'#10b981' },
                { label: '개발', data: [ {x:1,y:4},{x:2,y:3} ], backgroundColor:'#f59e42' },
              ]
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
            data={{
              labels: ['6/1','6/5','6/10','6/15','6/20','6/25','6/30'],
              datasets: [
                { label: '누적 예산(만원)',
                  data: [10, 20, 35, 50, 70, 90, 100],
                  borderColor: '#f59e42',
                  backgroundColor: 'rgba(245,158,66,0.2)',
                  fill: true,
                  tension: 0.4,
                },
              ]
            }}
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
              data={{
                labels: ['완료','진행','지연'],
                datasets: [{
                  data: [60, 30, 10],
                  backgroundColor: ['#10b981','#6366f1','#f87171'],
                }],
              }}
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