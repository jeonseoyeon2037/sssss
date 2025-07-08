'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import ForceGraph2D from 'react-force-graph-2d';
// import SankeyDiagram from './SankeyDiagram';
import { Chart as GoogleChart } from 'react-google-charts';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

export interface CompanyTasks {
  id: string;               // 지표 고유 ID
  department: string;       // 부서명 (전체는 '*')
  date: string;             // 집계 날짜 (yyyy-mm-dd)
  month: string;            // 월 단위 집계 (YYYY-MM)
  hours: number;            // 시간 투입 (분 단위)
  revenue: number;          // 매출 금액
  prod: number;             // 생산성 지표 수치
  fatigue: number;          // 피로도 지표 수치
  CS_count: number;         // 고객 문의 건수
  ROI: number;              // ROI (%)
  source: string;           // Sankey 출발 노드명
  target: string;           // Sankey 도착 노드명
  value: number;            // Sankey 흐름 값
}

export default function ProjectAnalytics() {
  const [companyMetrics, setCompanyMetrics] = useState<CompanyTasks[]>([]);

  const getRecent6Months = () => {
    const arr: string[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      arr.push(now.subtract(i, 'month').format('M월'));
    }
    return arr;
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/company-tasks')
      .then(res => res.json())
      .then((data: CompanyTasks[]) => setCompanyMetrics(data))
      .catch(console.error);
  }, []);

  const departments = Array.from(new Set(companyMetrics.map((d: any) => d.department)));

  //1. 부서별 시간당 매출 산점도
  const scatterByDept = useMemo(() => ({
    datasets: departments.map((dept, i) => ({
      label: dept,
      data: companyMetrics
        .filter((row: any) => row.department === dept)
        .map((row: any) => ({
          x: row.hours,
          y: row.revenue,
        })),
      backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6d28d9'][i % 5], // 파랑, 초록, 주황, 빨강, 보라
      pointRadius: 2,
      pointHoverRadius: 3,
    })),
  }), [companyMetrics, departments]);

  //2. 피로도×생산성 버블차트
  const bubbleByDept = useMemo(() => ({
    datasets: departments.map((dept, i) => ({
      label: dept,
      data: companyMetrics
        .filter((row: any) => row.department === dept)
        .map((row: any) => ({
          x: row.prod,      // X: 생산성
          y: row.fatigue,   // Y: 피로도
          r: Math.sqrt(row.hours), // 버블크기(시간)
        })),
      backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'][i % 5], // 부서별 색상
      borderColor: ['#2563eb', '#059669', '#b45309', '#6d28d9', '#be185d'][i % 5],
      // borderWidth: 1.5,
      pointRadius: 2,
      pointHoverRadius: 3,
    })),
  }), [companyMetrics, departments]);

  //3. 월별 듀얼라인차트 (생산성 vs 피로도)
  const months_3 = getRecent6Months();
  const monthlyDualLine = useMemo(() => {
    // { '1월': { prod:[], fatigue:[] }, ... }
    const map: Record<string, { prod: number[]; fatigue: number[] }> = {};
    companyMetrics.forEach((row: any) => {
      const month = row.month;
      if (!month) return;
      if (!map[month]) map[month] = { prod: [], fatigue: [] };
      if (typeof row.prod === 'number') map[month].prod.push(row.prod);
      if (typeof row.fatigue === 'number') map[month].fatigue.push(row.fatigue);
    });

    return {
      labels: months_3,
      datasets: [
        {
          label: '생산성',
          data: months_3.map(m => map[m]?.prod?.length
            ? Math.round(map[m].prod.reduce((a, b) => a + b, 0) / map[m].prod.length)
            : null),
          borderColor: '#2563eb',
          backgroundColor: '#2563eb11',
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#2563eb',
          pointRadius: 5,
          fill: false,
          tension: 0.3,
          yAxisID: 'y',
        },
        {
          label: '피로도',
          data: months_3.map(m => map[m]?.fatigue?.length
            ? Math.round(map[m].fatigue.reduce((a, b) => a + b, 0) / map[m].fatigue.length)
            : null),
          borderColor: '#f87171',
          backgroundColor: '#f8717111',
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#f87171',
          pointRadius: 5,
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
        },
      ],
    };
  }, [companyMetrics]);

  //4. Sankey 다이어그램
  const sankeyData = useMemo(() => {
    // 구글 차트 Sankey는 [from, to, value] 배열 필요, 첫 row는 헤더
    const rows = companyMetrics
      .filter((row: any) => row.source && row.target && typeof row.value === 'number')
      .map((row: any) => [row.source, row.target, row.value]);
    return [
      ['From', 'To', 'Value'],
      ...rows,
    ];
  }, [companyMetrics]);

  //5. 부서별 매출 막대그래프
  const deptColors = ['#2563eb', '#10b981', '#f59e42', '#6366f1', '#a3e635'];

  const deptRevenue = useMemo(() => {
  const map: Record<string, number> = {};
  companyMetrics.forEach((row: any) => {
    const dept = row.department;
    if (!dept) return;
    if (!map[dept]) map[dept] = 0;
    if (typeof row.revenue === 'number') map[dept] += row.revenue;
  });
  const labels = Object.keys(map);
  const data = labels.map(dept => map[dept]);
  return {
    labels,
    datasets: [
      {
        label: '매출(만원)',
        data,
        backgroundColor: labels.map((_, i) => deptColors[i % deptColors.length]),
        // borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };
}, [companyMetrics]);

//6. CS 건수 히스토그램
// 원하면 bins[]을 더 세분화/확대 가능
const bins = [0, 10, 20, 30, 40, 50];

const csHistogram = useMemo(() => {
  // CS_count 값만 추출
  const values = companyMetrics
    .map((row: any) => Number(row.CS_count))
    .filter((n: number) => !isNaN(n));

  // 구간별 집계
  const counts = bins.map((bin, i) => {
    if (i === bins.length - 1) return null;
    return values.filter(v => v >= bin && v < bins[i + 1]).length;
  }).filter(x => x !== null);

  // 레이블(구간)
  const labels = bins.slice(0, -1).map((b, i) => `${b}~${bins[i + 1] - 1}`);

  return {
    labels,
    datasets: [
      {
        label: 'CS 건수',
        data: counts,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        barPercentage: 0.8,
      },
    ],
  };
}, [companyMetrics]);

//7. 부서별 피로도 박스플롯 (바형태로 대체)
const deptList = Array.from(new Set(companyMetrics.map((row: any) => row.department)));

const fatigueByDept = useMemo(() => {
  // 부서별 fatigue 집계
  const map: Record<string, number[]> = {};
  companyMetrics.forEach((row: any) => {
    const dept = row.department;
    if (!dept) return;
    if (!map[dept]) map[dept] = [];
    if (typeof row.fatigue === 'number') map[dept].push(row.fatigue);
  });
  const labels = deptList;
  const minArr = labels.map(dept =>
    map[dept]?.length ? Math.min(...map[dept]) : null
  );
  const avgArr = labels.map(dept =>
    map[dept]?.length ? Math.round(map[dept].reduce((a, b) => a + b, 0) / map[dept].length) : null
  );
  const maxArr = labels.map(dept =>
    map[dept]?.length ? Math.max(...map[dept]) : null
  );
  return {
    labels,
    datasets: [
      {
        label: '최소',
        data: minArr,
        backgroundColor: '#c7d2fe',
      },
      {
        label: '평균',
        data: avgArr,
        backgroundColor: '#60a5fa',
      },
      {
        label: '최대',
        data: maxArr,
        backgroundColor: '#1e40af',
      },
    ],
  };
}, [companyMetrics, deptList]);

//8. 조직 활용도 면적차트
const months_8 = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('M월')
);
const departments_8 = Array.from(
  new Set(companyMetrics.map((row: any) => row.department))
);

const areaUtilization = useMemo(() => {
  // 월별, 부서별 hours 합산
  const map: Record<string, Record<string, number>> = {};
  months_8.forEach(month => {
    map[month] = {};
    departments_8.forEach(dept => (map[month][dept] = 0));
  });
  companyMetrics.forEach((row: any) => {
    const month = row.month;
    const dept = row.department;
    if (!month || !dept) return;
    if (!map[month]) map[month] = {};
    if (!map[month][dept]) map[month][dept] = 0;
    if (typeof row.hours === 'number') map[month][dept] += row.hours;
  });

  // 색상 지정 (이미지 참고: 파랑, 초록, 주황)
  const colors = ['#3b82f6', '#10b981', '#f59e42', '#6366f1'];

  return {
    labels: months_8,
    datasets: departments_8.map((dept, i) => ({
      label: dept,
      data: months_8.map(month => map[month][dept]),
      borderColor: colors[i % colors.length],
      backgroundColor: `${colors[i % colors.length]}33`, // 연한 면적색
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      borderWidth: 2,
    })),
  };
}, [companyMetrics]);

//9. ROI 선그래프
// 최근 6개월(1월~6월 등) 라벨
const months = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('M월')
);

const monthlyROI = useMemo(() => {
  // { '1월': ROI, ... }
  const map: Record<string, number> = {};
  companyMetrics.forEach((row: any) => {
    const month = row.month;
    if (!month) return;
    if (typeof row.ROI === 'number') map[month] = row.ROI;
  });

  return {
    labels: months,
    datasets: [
      {
        label: 'ROI',
        data: months.map(m => map[m] ?? null),
        borderColor: '#6366f1',
        backgroundColor: '#6366f133',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointRadius: 5,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}, [companyMetrics]);

  return (
    <>
      {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 부서별 시간당 매출 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">부서별 시간당 매출</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={scatterByDept}
              options={{
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: { title: { display: true, text: '투입시간(시간)' } },
                  y: { title: { display: true, text: '매출(만원)' } },
                },
              }}
            />
          </div>
        </div>

        {/* 2. 피로도×생산성 버블차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">피로도×생산성(버블)</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={bubbleByDept}
              options={{
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: { title: { display: true, text: '생산성' } },
                  y: { title: { display: true, text: '피로도' } },
                },
                elements: { point: { borderWidth: 1, borderColor: '#fff' } },
              }}
            />
          </div>
        </div>

        {/* 3. 월별 듀얼라인차트 (생산성 vs 피로도) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">월별 생산성 vs 피로도</div>
          <div className="flex-1 flex items-center">
            <Line
              data={monthlyDualLine}
              options={{
                plugins: { legend: { position: 'top' } },
                responsive: true,
                scales: {
                  x: { title: { display: true, text: '월' } },
                  y: { 
                    title: { display: true, text: '생산성' },
                    min: 0, max: 100, position: 'left', grid: { drawOnChartArea: true }
                  },
                  y1: {
                    title: { display: true, text: '피로도' },
                    min: 0, max: 100, position: 'right', grid: { drawOnChartArea: false }
                  },
                },
              }}
            />
          </div>
        </div>
        
        {/* 4. Sankey 다이어그램 (플레이스홀더) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px] items-center justify-center">
          <div className="font-semibold mb-3 text-[#22223b]">Sankey 다이어그램</div>
          <div className="w-full flex items-center justify-center">
          <GoogleChart
            chartType="Sankey"
            width="100%"
            height="300px"
            data={sankeyData}
            options={{
              sankey: {
                node: {
                  colors: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'],
                  label: { fontSize: 16, bold: true },
                  nodePadding: 28,
                  labelPadding: 10,
                },
                link: {
                  colorMode: 'source',
                  fillOpacity: 0.4,
                },
              },
            }}
          />
          </div>
        </div>
        
        {/* 5. 부서별 매출 막대그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">부서별 매출</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={deptRevenue}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '매출(만원)' } } },
              }}
            />
          </div>
        </div>

        {/* 6. CS 건수 히스토그램 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">CS 건수 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: ['0~10','10~20','20~30','30~40','40~50'],
                datasets: [{
                  label: '부서 수',
                  data: [2, 5, 8, 3, 1],
                  backgroundColor: '#6366f1',
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '부서 수' } } },
              }}
            />
          </div>
        </div>
        
        {/* 7. 부서별 피로도 박스플롯 (바형태로 대체) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">부서별 피로도</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={fatigueByDept}
              options={{
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '피로도' } } },
              }}
            />
          </div>
        </div>

        {/* 8. 조직 활용도 면적차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">조직 활용도(면적)</div>
          <div className="flex-1 flex items-center">
            <Line
              data={areaUtilization}
              options={{
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '투입시간' } } },
              }}
            />
          </div>
        </div>

        {/* 9. ROI 선그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">월별 ROI</div>
          <div className="flex-1 flex items-center">
            <Line
              data={monthlyROI}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'ROI' } } },
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
} 