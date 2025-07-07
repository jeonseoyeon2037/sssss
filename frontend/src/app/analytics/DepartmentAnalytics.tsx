'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import ForceGraph2D from 'react-force-graph-2d';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

interface DepartmentTask {
  id: string;                  // 문서/일정 고유 ID
  department: string;          // 부서명
  assignee: string;            // 담당자(팀원)
  task_owner: string;          // 일정 생성자
  participants: string[];      // 일정 참여자 목록
  type: string;                // 일정 유형(회의/실행/검토 등)
  delay: number;               // 응답시간(분)
  start_time: Date | string;   // 시작시간
  end_time: Date | string;     // 종료시간
  date: string;                // 일정 일자(YYYY-MM-DD 등)
  status: string;              // 상태(완료, 진행중 등)
  duration: number;            // 소요시간(분)
  quality?: number;            // 품질점수(품질 vs 시간 차트용, 없는 경우도 있음)
  emotion?: number;            // 감정점수(감정분석용, 없으면 제외)
  [key: string]: any;          // 확장성(필요시 추가 필드)
}

export default function DepartmentAnalytics() {
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/department-tasks')
      .then(res => res.json())
      .then((data: DepartmentTask[]) => setDepartmentTasks(data))
      .catch(console.error);
  }, []);

  //1번 차트 - 팀원별 응답시간
  const delayByAssignee = useMemo(() => {
    const delayMap: Record<string, { totalDelay: number; count: number }> = {};
    departmentTasks.forEach(({ assignee, delay }) => {
      if (!delayMap[assignee]) delayMap[assignee] = { totalDelay: 0, count: 0 };
      delayMap[assignee].totalDelay += delay;
      delayMap[assignee].count += 1;
    });

    const labels = Object.keys(delayMap);
    const data = labels.map(user => Math.round(delayMap[user].totalDelay / delayMap[user].count));

    return {
      labels,
      datasets: [
        {
          label: '평균 응답시간 (분)',
          data,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [departmentTasks]);

  //2번 차트: 일정 유형 파이차트
  const typePieData = useMemo(() => {
    const map: Record<string, number> = {};
    departmentTasks.forEach(({ type }) => {
      map[type] = (map[type] || 0) + 1;
    });
  
    const labels = Object.keys(map);
    const data = labels.map(label => map[label]);
  
    return {
      labels,
      datasets: [
        {
          label: '일정 유형 분포',
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        },
      ],
    };
  }, [departmentTasks]);

  //3번 차트: 시간대별 병목 히트맵
  const heatmapData = useMemo(() => {
    const timeBlocks = ['08-10', '10-12', '12-14', '14-16', '16-18'];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
  
    const map: Record<string, Record<string, number>> = {};
    timeBlocks.forEach(tb => {
      map[tb] = {};
      days.forEach(d => (map[tb][d] = 0));
    });
  
    departmentTasks.forEach(task => {
      const start = new Date(task.start_time);
      const end = new Date(task.end_time);
      const day = days[start.getDay()];
  
      const blockIndex = (hour: number) => {
        if (hour < 8) return null;
        const idx = Math.floor((hour - 8) / 2);
        return timeBlocks[idx] || null;
      };
  
      let hour = new Date(start).getHours();
      while (hour < new Date(end).getHours()) {
        const block = blockIndex(hour);
        if (block) {
          map[block][day] += 1;
        }
        hour += 1;
      }
    });
  
    // 2차원 배열로 변환 (시간대 행, 요일 열)
    return timeBlocks.map(tb => days.map(d => map[tb][d]));
  }, [departmentTasks]);

  //4. 협업 네트워크 그래프
  const nodes = new Set<string>();
  const edges: { from: string; to: string }[] = [];

  departmentTasks.forEach(task => {
    nodes.add(task.department);
    nodes.add(task.assignee);
    edges.push({ from: task.department, to: task.assignee });
  });

  const graphData = {
    nodes: Array.from(nodes).map(id => ({ id })),
    links: edges.map(e => ({ source: e.from, target: e.to })),
  };
  
  //5번 그래프: 업무 유형별 시간 분포
  const deptTypeDuration = useMemo(() => {
    // 1. 부서와 유형별로 누적 시간 합산
    const map: Record<string, Record<string, number>> = {};
    departmentTasks.forEach(({ department, type, duration }) => {
      if (!map[department]) map[department] = {};
      map[department][type] = (map[department][type] || 0) + duration;
    });
  
    // 2. 부서/유형 모두 모으기
    const departments = Object.keys(map);
    const allTypes = Array.from(
      new Set(departmentTasks.map(task => task.type))
    );
  
    // 3. Chart.js 데이터셋 생성
    const datasets = allTypes.map((type, idx) => ({
      label: type,
      data: departments.map(dep => map[dep][type] || 0),
      backgroundColor: ['#60a5fa', '#f59e0b', '#10b981', '#ef4444'][idx % 4],
      stack: 'total'
    }));
  
    return { labels: departments, datasets };
  }, [departmentTasks]);

  //6. 팀원별 소요시간 분포 (BoxPlot)
  const execTimeStats = useMemo(() => {
    const map: Record<string, number[]> = {};
    departmentTasks.forEach(({ assignee, duration }) => {
      if (!map[assignee]) map[assignee] = [];
      map[assignee].push(duration);
    });
    const labels = Object.keys(map);
    const minData = labels.map(name => Math.min(...map[name]));
    const avgData = labels.map(name =>
      Math.round(map[name].reduce((a, b) => a + b, 0) / map[name].length)
    );
    const maxData = labels.map(name => Math.max(...map[name]));
    return {
      labels,
      datasets: [
        {
          label: '최소',
          data: minData,
          backgroundColor: 'rgba(59,130,246,0.1)',
        },
        {
          label: '평균',
          data: avgData,
          backgroundColor: 'rgba(59,130,246,0.5)',
        },
        {
          label: '최대',
          data: maxData,
          backgroundColor: 'rgba(30, 64, 175, 0.9)',
        },
      ],
    };
  }, [departmentTasks]);

  //7번째 품질 vs 시간 산점도
  const qualityScatter = useMemo(() => {
    // quality라는 필드가 있다고 가정 (없으면 실제 필드명으로 교체)
    return {
      datasets: [
        {
          label: '품질 vs 시간',
          data: departmentTasks
            .filter(task => typeof task.duration === 'number' && typeof task.quality === 'number')
            .map(task => ({ x: task.duration, y: task.quality })),
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [departmentTasks]);
  
  //8번 차트: 월별 작업량 라인차트
  const monthlyCount = useMemo(() => {
    const map: Record<string, number> = {};
    departmentTasks.forEach(({ date }) => {
      // date가 YYYY-MM-DD 형태라고 가정
      const month = typeof date === 'string' ? date.slice(0, 7) : '';
      if (month) map[month] = (map[month] || 0) + 1;
    });
    const labels = Object.keys(map).sort();
    const data = labels.map(month => map[month]);
    return {
      labels,
      datasets: [
        {
          label: '월별 작업량',
          data,
          fill: false,
          borderColor: '#3b82f6',
          backgroundColor: '#60a5fa',
          tension: 0.4,
        },
      ],
    };
  }, [departmentTasks]);

  //9번 차트: 월별 이슈(지연) 발생률 (late=1 기준)
  const assignees = Array.from(new Set(departmentTasks.map(t => t.assignee)));
  const types = Array.from(new Set(departmentTasks.map(t => t.type)));

  const issueMatrix = useMemo(() => {
    // 각 [담당자][유형]별로 late=1 건수 집계
    const matrix: Record<string, Record<string, number>> = {};
    assignees.forEach(a => {
      matrix[a] = {};
      types.forEach(t => (matrix[a][t] = 0));
    });
    departmentTasks.forEach(({ assignee, type, late }) => {
      if (late === 1) matrix[assignee][type]++;
    });
    return matrix;
  }, [departmentTasks]);

  const groupedBarData = useMemo(() => ({
    labels: assignees,
    datasets: types.map((type, i) => ({
      label: type,
      data: assignees.map(a => issueMatrix[a][type]),
      backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#6d28d9'][i % 4], // 파랑, 주황, 초록, 보라
    })),
  }), [assignees, types, issueMatrix]);

  return (
    <>
      {/* 3x3 그리드: 9개 부서 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 팀원별 응답시간 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">팀원별 응답시간</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={delayByAssignee}
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
              data={typePieData}
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
                {heatmapData.map((row, i) => (
                <div key={i} className="flex mb-1 last:mb-0">
                  {row.map((val, j) => {
                    let color = 'bg-blue-50';
                    if (val >= 6) color = 'bg-blue-700';
                    else if (val >= 4) color = 'bg-blue-500';
                    else if (val >= 2) color = 'bg-blue-300';
                    else if (val >= 1) color = 'bg-blue-100';
                    return (
                      <div key={j} className={`rounded-lg ${color}`} style={{width:36,height:36,marginRight:j<row.length-1?8:0}}>
                        <span className="text-xs text-white font-bold flex items-center justify-center h-full w-full">{val}</span>
                      </div>
                    );
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
              graphData={graphData}
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
              data={deptTypeDuration}
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
            data={execTimeStats}
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
            data={qualityScatter}
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
            data={monthlyCount}
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
            data={groupedBarData}
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