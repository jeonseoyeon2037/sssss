'use client';

import { useState } from 'react';
import { Bar, Scatter, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// 샘플 통계값 (이미지와 동일)
const stats = [
  {
    label: '이행률',
    value: '78%',
    icon: <CheckCircleIcon className="w-7 h-7 text-primary-500 mb-1" />,
    color: 'text-primary-600',
    border: 'border-blue-100',
  },
  {
    label: '평균 수',
    value: '35',
    icon: (
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 mb-1">
        <span className="text-blue-400 text-lg font-bold">%</span>
      </div>
    ),
    color: 'text-blue-500',
    border: 'border-blue-100',
  },
  {
    label: '연기율',
    value: '19%',
    icon: <ArrowPathIcon className="w-7 h-7 text-green-500 mb-1" />,
    color: 'text-green-500',
    border: 'border-green-100',
  },
  {
    label: '연기 횟수',
    value: '5',
    icon: <ExclamationTriangleIcon className="w-7 h-7 text-red-400 mb-1" />,
    color: 'text-red-500',
    border: 'border-red-100',
  },
];

// 히트맵 샘플 (가로: 요일, 세로: 시간대)
const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
const timeBlocks = ['08-10', '10-12', '12-14', '14-16', '16-18'];
// 5(시간대) x 7(요일)
const heatmap = [
  [2, 3, 1, 0, 0, 0, 0], // 08-10
  [3, 4, 2, 1, 0, 0, 0], // 10-12
  [2, 3, 2, 1, 0, 0, 0], // 12-14
  [1, 2, 1, 0, 0, 0, 0], // 14-16
  [0, 1, 0, 0, 0, 0, 0], // 16-18
];

// 막대그래프 샘플
const barData = {
  labels: ['1열', '2열', '3열'],
  datasets: [
    {
      label: '이행',
      data: [70, 80, 65],
      backgroundColor: '#3b82f6',
    },
    {
      label: '연기',
      data: [40, 60, 45],
      backgroundColor: '#f59e42',
    },
    {
      label: '미이행',
      data: [60, 70, 50],
      backgroundColor: '#fbbf24',
    },
  ],
};

// 산점도 샘플 (시간 ROI: 일정별 예상 소요시간 대비 실산출)
const scatterData = {
  datasets: [
    {
      label: '예상 소요시간',
      data: [
        { x: 2, y: 1500 }, { x: 4, y: 2000 }, { x: 6, y: 1800 }, { x: 8, y: 2500 }, { x: 10, y: 2200 },
        { x: 12, y: 3000 }, { x: 14, y: 2700 }, { x: 16, y: 3200 }, { x: 18, y: 2900 }, { x: 20, y: 3500 },
        { x: 22, y: 3300 }, { x: 24, y: 3700 },
      ],
      backgroundColor: '#10b981',
    },
    {
      label: '실산출',
      data: [
        { x: 1, y: 1200 }, { x: 3, y: 1600 }, { x: 5, y: 1400 }, { x: 7, y: 2100 }, { x: 9, y: 1700 },
        { x: 11, y: 2500 }, { x: 13, y: 2300 }, { x: 15, y: 2700 }, { x: 17, y: 2500 }, { x: 19, y: 3100 },
        { x: 21, y: 2900 }, { x: 23, y: 3300 },
      ],
      backgroundColor: '#38bdf8',
    },
  ],
};

// 감정 점수 변화 (선그래프)
const lineData = {
  labels: weekDays,
  datasets: [
    {
      label: '감정 점수',
      data: [3.5, 3.8, 4.0, 3.6, 3.9, 3.7, 4.1],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

// 샘플 일정 데이터 (중요도: 1~5, 반복: 0~3)
const sampleTasks = [
  { title: '보고서 작성', importance: 5, repeat: 2 },
  { title: '운동', importance: 4, repeat: 0 },
  { title: '팀 미팅', importance: 3, repeat: 1 },
  { title: '메일 확인', importance: 2, repeat: 3 },
  { title: '문서 정리', importance: 1, repeat: 0 },
  { title: '기획안 작성', importance: 5, repeat: 3 },
  { title: '고객 미팅', importance: 4, repeat: 2 },
  { title: '디자인 검토', importance: 2, repeat: 1 },
];
// 산점도 데이터 변환
const eisenhowerScatter = {
  datasets: [
    {
      label: '일정',
      data: sampleTasks.map(t => ({
        x: t.importance,
        y: t.repeat,
        label: t.title,
      })),
      backgroundColor: '#2563eb',
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
};
const eisenhowerOptions = {
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.raw.label} (중요도: ${ctx.raw.x}, 반복: ${ctx.raw.y})`,
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 5,
      title: { display: true, text: '중요도', font: { size: 16 } },
      grid: {
        color: (ctx: any) => ctx.tick.value === 2.5 ? '#222' : '#e5e7eb',
        lineWidth: (ctx: any) => ctx.tick.value === 2.5 ? 3 : 1,
      },
      ticks: { stepSize: 1, font: { size: 14 } },
    },
    y: {
      min: 0,
      max: 3,
      title: { display: true, text: '반복', font: { size: 16 } },
      grid: {
        color: (ctx: any) => ctx.tick.value === 1.5 ? '#222' : '#e5e7eb',
        lineWidth: (ctx: any) => ctx.tick.value === 1.5 ? 3 : 1,
      },
      ticks: { stepSize: 1, font: { size: 14 } },
    },
  },
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'personal'|'department'|'company'|'project'>('personal');
  const tabs = [
    { key: 'personal', label: '개인' },
    { key: 'department', label: '부서' },
    { key: 'company', label: '회사' },
    { key: 'project', label: '프로젝트' },
  ];
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">일정 분석</h1>
            <p className="text-secondary-600">일정의 패턴과 생산성 인사이트를 확인하세요</p>
          </div>
          {/* 탭 UI */}
          <div className="flex gap-2 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150
                  ${activeTab === tab.key ? 'bg-white border-blue-500 text-blue-600' : 'bg-blue-50 border-transparent text-blue-400 hover:bg-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* 탭별 컨텐츠 */}
          {activeTab === 'personal' && (
            <>
              {/* 기존 개인 분석 전체 영역 */}
              {/* 주요 지표 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-2xl border ${s.border} shadow-sm flex flex-row items-center py-8 px-8 transition hover:shadow-lg min-h-[140px]`}
                    style={{ background: '#fff' }}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#f5f8fd] mr-6">
                      {s.icon}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[#7b8794] text-base mb-1">{s.label}</span>
                      <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* 1행 3열 레이아웃 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 집중 시간대 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-w-[260px]">
                  <div className="font-semibold mb-3 text-[#22223b] w-full text-left">집중 시간대</div>
                  <div className="flex">
                    {/* 왼쪽 시간대 라벨 */}
                    <div className="flex flex-col justify-center mr-2">
                      {timeBlocks.map((block, i) => (
                        <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height: 36}}>{block}</div>
                      ))}
                    </div>
                    {/* 히트맵 정사각형 */}
                    <div className="flex flex-col">
                      {heatmap.map((row, i) => (
                        <div key={i} className="flex mb-1 last:mb-0">
                          {row.map((val, j) => {
                            let color = 'bg-[#f7fafd]';
                            if (val === 1) color = 'bg-blue-100';
                            else if (val === 2) color = 'bg-blue-300';
                            else if (val === 3) color = 'bg-blue-500';
                            else if (val >= 4) color = 'bg-blue-700';
                            return (
                              <div key={j} className={`rounded-lg ${color}`} style={{ width: 36, height: 36, marginRight: j < row.length-1 ? 8 : 0 }}></div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 하단 요일 라벨 */}
                  <div className="flex mt-3 ml-12">
                    {weekDays.map((label, idx) => (
                      <div key={label+idx} className="w-9 text-center text-[#7b8794] text-sm" style={{width: 36, marginRight: idx < weekDays.length-1 ? 8 : 0}}>{label}</div>
                    ))}
                  </div>
                </div>
                {/* 이행/연기/미이행 막대그래프 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 min-w-[260px] min-h-[260px] overflow-x-auto flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">이행률 & 연기율</div>
                  <div className="flex-1 flex items-center justify-center">
                    <Bar
                      data={barData}
                      options={{
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { font: { size: 14, family: 'inherit' } },
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { grid: { display: false } },
                          y: { beginAtZero: true, max: 100, grid: { color: '#e5e7eb' } },
                        },
                      }}
                      style={{ height: 220 }}
                    />
                  </div>
                </div>
                {/* ROI 산점도 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 min-w-[260px] overflow-x-auto">
                  <div className="font-semibold mb-3 text-[#22223b]">시간 ROI</div>
                  <Scatter
                    data={scatterData}
                    options={{
                      plugins: {
                        legend: { position: 'top', labels: { font: { size: 14 } } },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) => {
                              const raw = ctx.raw as any;
                              return `예상 소요시간: ${raw.x}시간, 실산출: ${raw.y} (예: 글자 수, 회의 결과물)`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: { title: { display: true, text: '예상 소요시간(시간)' }, min: 0, max: 24, grid: { color: '#e5e7eb' } },
                        y: { title: { display: true, text: '실산출 (예: 글자 수, 회의 결과물)' }, min: 0, max: 4000, grid: { color: '#e5e7eb' } },
                      },
                    }}
                    height={180}
                  />
                </div>
              </div>
              {/* 하단: 아이젠하워 매트릭스 + 감정 상태 연관 분석 (윗행과 동일한 폭/정렬) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-8 w-full">
                {/* 아이젠하워 매트릭스 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-50 min-w-[260px] flex flex-col items-center">
                  {/* <div className="font-bold text-lg text-[#22223b] mb-4">아이젠하워 매트릭스</div> */}
                  <div className="relative w-full max-w-2xl h-[400px] mx-auto" style={{ aspectRatio: '1/1' }}>
                    {/* 4사분면 구분선 */}
                    <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-300 z-10" style={{transform: 'translateX(-1px)'}}></div>
                    <div className="absolute top-1/2 left-0 h-0.5 w-full bg-gray-300 z-10" style={{transform: 'translateY(-1px)'}}></div>
                    {/* 점(dot) 배치 */}
                    {sampleTasks.map((t, i) => {
                      // 중요도(1~5), 반복(0~3) → 0~1 정규화
                      const x = (t.importance - 1) / 4; // 0~1
                      const y = 1 - (t.repeat / 3); // 0(하단)~1(상단)
                      return (
                        <div
                          key={t.title}
                          title={t.title}
                          className="absolute z-20 group"
                          style={{
                            left: `calc(${x * 100}% - 6px)` ,
                            top: `calc(${y * 100}% - 6px)` ,
                            width: 12, height: 12,
                          }}
                        >
                          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80 group-hover:scale-150 group-hover:bg-blue-700 transition" />
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full bg-white text-xs text-gray-700 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{t.title}</div>
                        </div>
                      );
                    })}
                    {/* 사분면 라벨 */}
                    <div className="absolute left-2 top-2 text-xs text-gray-400">중요도↓<br/>반복↑</div>
                    <div className="absolute right-2 top-2 text-xs text-gray-400">중요도↑<br/>반복↑</div>
                    <div className="absolute left-2 bottom-2 text-xs text-gray-400">중요도↓<br/>반복↓</div>
                    <div className="absolute right-2 bottom-2 text-xs text-gray-400">중요도↑<br/>반복↓</div>
                    {/* 축 라벨 */}
                    <div className="absolute left-1/2 bottom-0 text-sm text-gray-500" style={{transform:'translateX(-50%) translateY(120%)'}}>중요도</div>
                    <div className="absolute left-0 top-1/2 text-sm text-gray-500" style={{transform:'translateY(-50%) rotate(-90deg) translateX(-120%)'}}>반복</div>
                  </div>
                </div>
                {/* 감정 상태 연관 분석: 일정 전후 감정 태그(스트레스·만족도) 및 감정 점수 변화 선그래프 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-50 min-w-[260px] flex flex-col items-center">
                  <div className="font-bold text-lg text-[#22223b] mb-2">감정 상태 연관 분석</div>
                  <div className="text-gray-700 text-base mb-4 text-center">
                    일정 전후 감정 태그(스트레스·만족도)와 감정 점수 변화 추이를 확인하세요.
                  </div>
                  <div className="w-full" style={{ maxWidth: 600 }}>
                    <Line
                      data={lineData}
                      options={{
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx: any) => `감정 점수: ${ctx.raw}`,
                            },
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: { min: 0, max: 5, title: { display: true, text: '감정 점수' }, grid: { color: '#e5e7eb' } },
                          x: { title: { display: true, text: '요일' }, grid: { color: '#e5e7eb' } },
                        },
                      }}
                      height={220}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          {/* 부서탭: 부서 일정 분석 대시보드 */}
          {activeTab === 'department' && (
            <>
              {/* 부서 주요 지표 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* 협업 응답 시간 */}
                <div className="rounded-2xl border border-blue-100 shadow-sm flex flex-row items-center py-8 px-8 transition hover:shadow-lg min-h-[140px] bg-white">
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#f5f8fd] mr-6">
                    <ArrowPathIcon className="w-7 h-7 text-blue-500 mb-1" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[#7b8794] text-base mb-1">협업 응답 시간</span>
                    <span className="text-3xl font-extrabold text-blue-600">4시간</span>
                  </div>
                </div>
                {/* 병목 구간 */}
                <div className="rounded-2xl border border-green-100 shadow-sm flex flex-row items-center py-8 px-8 transition hover:shadow-lg min-h-[140px] bg-white">
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mr-6">
                    <ExclamationTriangleIcon className="w-7 h-7 text-green-500 mb-1" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[#7b8794] text-base mb-1">병목 구간</span>
                    <span className="text-3xl font-extrabold text-green-500">월수금 14–16시<br/>동시 8건</span>
                  </div>
                </div>
                {/* 자원 활용률 */}
                <div className="rounded-2xl border border-yellow-100 shadow-sm flex flex-row items-center py-8 px-8 transition hover:shadow-lg min-h-[140px] bg-white">
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-yellow-50 mr-6">
                    <CheckCircleIcon className="w-7 h-7 text-yellow-500 mb-1" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[#7b8794] text-base mb-1">자원 활용률</span>
                    <span className="text-3xl font-extrabold text-yellow-500">78%</span>
                  </div>
                </div>
                {/* 업무 분포 */}
                <div className="rounded-2xl border border-purple-100 shadow-sm flex flex-row items-center py-8 px-8 transition hover:shadow-lg min-h-[140px] bg-white">
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-purple-50 mr-6">
                    <span className="text-purple-400 text-lg font-bold">%</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[#7b8794] text-base mb-1">업무 분포</span>
                    <span className="text-3xl font-extrabold text-purple-500">회의 35%<br/>실행 50%</span>
                  </div>
                </div>
              </div>
              {/* 1행 4열: 네트워크 그래프, Gantt, 스택형 막대, 박스플롯 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* 네트워크 그래프 (placeholder) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-w-[220px] min-h-[260px]">
                  <div className="font-semibold mb-3 text-[#22223b] w-full text-left">일정 의존성 네트워크</div>
                  <div className="flex-1 flex items-center justify-center w-full h-full">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-400">Network<br/>Graph</div>
                  </div>
                </div>
                {/* Gantt 차트 (placeholder) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center min-w-[220px] min-h-[260px]">
                  <div className="font-semibold mb-3 text-[#22223b] w-full text-left">Gantt 차트</div>
                  <div className="flex-1 flex items-center justify-center w-full h-full">
                    <div className="w-32 h-16 bg-green-100 rounded-lg flex items-center justify-center text-green-400">Gantt<br/>Chart</div>
                  </div>
                </div>
                {/* 스택형 막대그래프 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 min-w-[220px] min-h-[260px] flex flex-col">
                  <div className="font-semibold mb-3 text-[#22223b]">업무 유형별 시간 분포</div>
                  <div className="flex-1 flex items-center justify-center">
                    <Bar
                      data={{
                        labels: ['회의', '실행', '검토'],
                        datasets: [
                          { label: 'A팀', data: [10, 20, 5], backgroundColor: '#6366f1' },
                          { label: 'B팀', data: [8, 15, 7], backgroundColor: '#f59e42' },
                          { label: 'C팀', data: [12, 18, 6], backgroundColor: '#10b981' },
                        ],
                      }}
                      options={{
                        plugins: {
                          legend: { position: 'bottom', labels: { font: { size: 14 } } },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { stacked: true, grid: { display: false } },
                          y: { stacked: true, beginAtZero: true, grid: { color: '#e5e7eb' } },
                        },
                      }}
                      style={{ height: 180 }}
                    />
                  </div>
                </div>
                {/* 박스플롯 (placeholder) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 min-w-[220px] min-h-[260px] flex flex-col items-center">
                  <div className="font-semibold mb-3 text-[#22223b] w-full text-left">팀원별 소요시간 분포</div>
                  <div className="flex-1 flex items-center justify-center w-full h-full">
                    <div className="w-24 h-24 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-400">Boxplot</div>
                  </div>
                </div>
              </div>
              {/* AI 보고서 & 조언 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-50 w-full max-w-2xl mx-auto mb-8 mt-8 flex flex-col items-start">
                <div className="font-bold text-lg text-[#22223b] mb-4">AI 보고서 & 조언</div>
                <div className="text-gray-700 text-base mb-2">
                  <b>주요 협업 병목 인사이트</b><br/>
                  • 평균 응답 시간: <b>4시간</b><br/>
                  • 병목 구간: <b>월수금 14–16시 동시 8건</b><br/>
                  • 회의 비율: <b>35%</b>, 실행 비율: <b>50%</b>
                </div>
                <div className="text-gray-700 text-base mb-2">
                  <b>팀 전체 생산성 향상을 위한 자원 재배치·자동화 제안</b><br/>
                  • 병목 시간대 회의 예약 분산<br/>
                  • 반복 업무(n8n/Make) 자동화<br/>
                  • 핵심 업무 전담 리소스 지정
                </div>
              </div>
            </>
          )}
          {activeTab !== 'personal' && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-blue-50 text-center text-xl text-gray-400">
              {tabs.find(t => t.key === activeTab)?.label} 영역 분석은 준비중입니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}