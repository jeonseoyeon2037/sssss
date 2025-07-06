import { Bar, Pie, Scatter, Line } from 'react-chartjs-2';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function DepartmentAnalytics() {
  return (
    <>
      {/* 3x3 그리드: 9개 부서 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 팀원별 응답시간 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 응답시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={{
                labels: ['홍길동','김철수','이영희','박민수'],
                datasets: [{
                  label: '평균 지연(분)',
                  data: [15, 22, 10, 30],
                  backgroundColor: '#3b82f6',
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '평균 지연(분)' } } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
        {/* 2. 일정 유형 파이차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 유형 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={{
                labels: ['회의','실행','검토'],
                datasets: [{
                  data: [40, 35, 25],
                  backgroundColor: ['#6366f1','#10b981','#f59e42'],
                }],
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
        {/* 3. 시간대별 병목 히트맵 (커스텀) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 병목</div>
          <div className="flex">
            <div className="flex flex-col justify-center mr-2">
              {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
                <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
              ))}
            </div>
            <div className="flex flex-col">
              {[[2,3,1,0,0,0,0],[3,4,2,1,0,0,0],[2,3,2,1,0,0,0],[1,2,1,0,0,0,0],[0,1,0,0,0,0,0]].map((row,i) => (
                <div key={i} className="flex mb-1 last:mb-0">
                  {row.map((val,j) => {
                    let color = 'bg-blue-50';
                    if(val>=4) color='bg-red-700';
                    else if(val===3) color='bg-red-500';
                    else if(val===2) color='bg-red-300';
                    else if(val===1) color='bg-red-100';
                    return <div key={j} className={`rounded-lg ${color}`} style={{width:36,height:36,marginRight:j<row.length-1?8:0}}><span className="text-xs text-white font-bold flex items-center justify-center h-full w-full">{val}</span></div>;
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex mt-3 ml-12">
            {['월','화','수','목','금','토','일'].map((label,idx) => (
              <div key={label+idx} className="w-9 text-center text-[#7b8794] text-sm" style={{width:36,marginRight:idx<6?8:0}}>{label}</div>
            ))}
          </div>
        </div>
        {/* 4. 협업 네트워크 그래프 (실제 차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[220px]">
          <div className="font-semibold mb-3 text-[#22223b]">협업 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center" style={{height:200}}>
            <ForceGraph2D
              graphData={{
                nodes: [
                  { id: '영업팀', group: 1 },
                  { id: '개발팀', group: 1 },
                  { id: '디자인팀', group: 2 },
                  { id: '기획팀', group: 2 },
                  { id: 'CS팀', group: 3 },
                ],
                links: [
                  { source: '영업팀', target: '개발팀' },
                  { source: '영업팀', target: '디자인팀' },
                  { source: '개발팀', target: '기획팀' },
                  { source: '디자인팀', target: 'CS팀' },
                  { source: '기획팀', target: 'CS팀' },
                ],
              }}
              nodeLabel={(node: any) => node.id}
              nodeAutoColorBy="group"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={220}
              height={200}
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
        {/* 5. 팀원별 작업량 스택바 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[240px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 작업량</div>
          <div className="flex-1">
            <Bar
              data={{
                labels: ['홍길동','김철수','이영희','박민수'],
                datasets: [
                  { label: '회의', data: [5, 3, 4, 2], backgroundColor:'#6366f1' },
                  { label: '실행', data: [8, 7, 6, 5], backgroundColor:'#10b981' },
                  { label: '검토', data: [2, 4, 3, 6], backgroundColor:'#f59e42' },
                ]
              }}
              options={{
                plugins: { legend: { position: 'bottom' } },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, title: { display: true, text: '시간' } },
                },
              }}
            />
          </div>
        </div>
        {/* 6. 수행시간 분포 박스플롯 (바형태로 대체) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">수행시간 분포</div>
          <Bar
            data={{
              labels: ['홍길동','김철수','이영희','박민수'],
              datasets: [
                { label: '최소', data: [30,20,25,15], backgroundColor:'#dbeafe' },
                { label: '평균', data: [60,50,55,40], backgroundColor:'#3b82f6' },
                { label: '최대', data: [120,90,100,80], backgroundColor:'#1e40af' },
              ]
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '수행시간(분)' } } },
            }}
            height={180}
          />
        </div>
        {/* 7. 품질 vs 시간 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">품질 vs 시간</div>
          <Scatter
            data={{
              datasets: [
                { label: '홍길동', data: [ {x:30,y:80},{x:60,y:85},{x:90,y:70} ], backgroundColor:'#3b82f6' },
                { label: '김철수', data: [ {x:30,y:75},{x:60,y:80},{x:90,y:65} ], backgroundColor:'#10b981' },
                { label: '이영희', data: [ {x:30,y:90},{x:60,y:95},{x:90,y:85} ], backgroundColor:'#f59e42' },
              ]
            }}
            options={{
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: '수행시간(분)' } },
                y: { min: 0, max: 100, title: { display: true, text: '품질점수' } },
              },
            }}
            height={180}
          />
        </div>
        {/* 8. 월별 작업량 라인차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">월별 작업량</div>
          <Line
            data={{
              labels: ['2024-01','2024-02','2024-03','2024-04','2024-05','2024-06'],
              datasets: [{
                label: '작업 건수',
                data: [20, 25, 30, 28, 35, 40],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.1)',
                fill: true,
                tension: 0.4,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '작업 건수' } } },
            }}
            height={180}
          />
        </div>
        {/* 9. 이슈 발생률 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">이슈 발생률</div>
          <Bar
            data={{
              labels: ['홍길동','김철수','이영희','박민수'],
              datasets: [
                { label: '업무', data: [2, 1, 0, 3], backgroundColor:'#3b82f6' },
                { label: '회의', data: [1, 2, 1, 0], backgroundColor:'#f59e42' },
                { label: '검토', data: [0, 1, 2, 1], backgroundColor:'#10b981' },
              ]
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '지연 건수' } } },
            }}
            height={180}
          />
        </div>
      </div>
    </>
  );
} 