import { Bar, Line, Scatter } from 'react-chartjs-2';
import SankeyDiagram from './SankeyDiagram';

export default function ProjectAnalytics() {
  return (
    <>
      {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 부서별 시간당 매출 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">부서별 시간당 매출</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={{
                datasets: [
                  { label: '영업', data: [ {x:100,y:2000}, {x:120,y:2500}, {x:90,y:1800} ], backgroundColor:'#3b82f6' },
                  { label: '개발', data: [ {x:110,y:1500}, {x:130,y:1700}, {x:100,y:1600} ], backgroundColor:'#10b981' },
                  { label: 'CS', data: [ {x:80,y:1200}, {x:95,y:1300}, {x:85,y:1100} ], backgroundColor:'#f59e42' },
                ]
              }}
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
              data={{
                datasets: [
                  { label: '부서A', data: [ {x:80,y:60,r:15}, {x:90,y:70,r:20} ], backgroundColor:'rgba(59,130,246,0.5)' },
                  { label: '부서B', data: [ {x:70,y:80,r:10}, {x:60,y:90,r:18} ], backgroundColor:'rgba(16,185,129,0.5)' },
                ]
              }}
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
              data={{
                labels: ['1월','2월','3월','4월','5월','6월'],
                datasets: [
                  { label: '생산성', data: [80, 85, 90, 88, 92, 95], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: false, yAxisID: 'y1' },
                  { label: '피로도', data: [60, 65, 70, 75, 80, 85], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', fill: false, yAxisID: 'y2' },
                ]
              }}
              options={{
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: { title: { display: true, text: '월' } },
                  y1: { type: 'linear', position: 'left', title: { display: true, text: '생산성' }, min: 0, max: 100 },
                  y2: { type: 'linear', position: 'right', title: { display: true, text: '피로도' }, min: 0, max: 100, grid: { drawOnChartArea: false } },
                },
              }}
            />
          </div>
        </div>
        {/* 4. Sankey 다이어그램 (플레이스홀더) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px] items-center justify-center">
          <div className="font-semibold mb-3 text-[#22223b]">Sankey 다이어그램</div>
          <div className="w-full flex items-center justify-center">
            <SankeyDiagram />
          </div>
        </div>
        {/* 5. 부서별 매출 막대그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">부서별 매출</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: ['영업','개발','CS','기획'],
                datasets: [{
                  label: '매출(만원)',
                  data: [5000, 4000, 2000, 1500],
                  backgroundColor: ['#3b82f6','#10b981','#f59e42','#6366f1'],
                }],
              }}
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
              data={{
                labels: ['영업','개발','CS','기획'],
                datasets: [
                  { label: '최소', data: [30, 40, 35, 45], backgroundColor:'#dbeafe' },
                  { label: '평균', data: [60, 70, 65, 75], backgroundColor:'#3b82f6' },
                  { label: '최대', data: [90, 95, 85, 100], backgroundColor:'#1e40af' },
                ]
              }}
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
              data={{
                labels: ['1월','2월','3월','4월','5월','6월'],
                datasets: [
                  { label: '영업', data: [100, 120, 130, 140, 150, 160], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true },
                  { label: '개발', data: [90, 100, 110, 120, 130, 140], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true },
                  { label: 'CS', data: [80, 85, 90, 95, 100, 105], borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.1)', fill: true },
                ]
              }}
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
              data={{
                labels: ['1월','2월','3월','4월','5월','6월'],
                datasets: [
                  { label: 'ROI', data: [1.2, 1.3, 1.5, 1.4, 1.6, 1.7], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
                ]
              }}
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