'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

interface Task {
  date: string;
  start_time: Date;
  end_time: Date;
  status: string;
  tag: string;
  duration: number;
  emotion: number;
}

export default function PersonalAnalytics() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/personal-tasks')
      .then(res => res.json())
      .then((data: Task[]) => {
        const parsed = data.map(task => ({
          ...task,
          start_time: new Date(task.start_time),
          end_time: new Date(task.end_time)
        }));
        setTasks(parsed);
      })
      .catch(console.error);
  }, []);

  // Chart 1: 일별 완료율
  const dailyCompletion = (() => {
    const dateMap: Record<string, { total: number; done: number }> = {};
    tasks.forEach(({ date, status }) => {
      if (!dateMap[date]) dateMap[date] = { total: 0, done: 0 };
      dateMap[date].total++;
      if (status === 'done') dateMap[date].done++;
    });
    const labels = Object.keys(dateMap);
    const data = labels.map(date => (dateMap[date].done / dateMap[date].total) * 100);
    return { labels, data };
  })();

  // Chart 2: 요일×시간대 히트맵
  const timeHeatmap = (() => {
    const matrix: number[][] = Array(5).fill(null).map(() => Array(7).fill(0));
    const counts: number[][] = Array(5).fill(null).map(() => Array(7).fill(0));
    tasks.forEach(({ start_time, status }) => {
      const hour = dayjs(start_time).hour();
      const weekday = dayjs(start_time).day();
      const row = Math.floor((hour - 8) / 2);
      const col = (weekday + 6) % 7;
      if (row >= 0 && row < 5) {
        counts[row][col]++;
        if (status === 'done') matrix[row][col]++;
      }
    });
    return matrix.map((row, i) => row.map((val, j) => counts[i][j] ? Math.round((val / counts[i][j]) * 100) : 0));
  })();

  // Chart 3: 태그별 이행률
  const tagStats = (() => {
    const map: Record<string, { total: number; done: number }> = {};
    tasks.forEach(({ tag, status }) => {
      if (!map[tag]) map[tag] = { total: 0, done: 0 };
      map[tag].total++;
      if (status === 'done') map[tag].done++;
    });
    const labels = Object.keys(map);
    const data = labels.map(t => Math.round((map[t].done / map[t].total) * 100));
    return { labels, data };
  })();

  // Chart 4: 주간 이행률 스택드 차트
  const durationHistogram = useMemo(() => {
    const bins = [0, 30, 60, 90, 120, 180, 240, 300]; // 분 단위 구간
    const binLabels = ['0~30', '30~60', '60~90', '90~120', '120~180', '180~240', '240~300+'];
    const counts = Array(binLabels.length).fill(0);
  
    tasks.forEach(({ duration }) => {
      const idx = bins.findIndex((b, i) => duration >= b && duration < (bins[i + 1] ?? Infinity));
      if (idx >= 0) counts[idx]++;
    });
  
    return { labels: binLabels, data: counts };
  }, [tasks]);

  // Chart 5: 주간 이행률 스택드 차트
  const weeklyStacked = (() => {
    const map: Record<string, { done: number; delayed: number; not: number }> = {};
    tasks.forEach(({ date, status }) => {
      const week = dayjs(date).startOf('week').format('YYYY-MM-DD');
      if (!map[week]) map[week] = { done: 0, delayed: 0, not: 0 };
      if (status === 'done') map[week].done++;
      else if (status === 'delayed') map[week].delayed++;
      else map[week].not++;
    });
    const labels = Object.keys(map);
    return {
      labels,
      datasets: [
        { label: '이행', data: labels.map(w => map[w].done), backgroundColor: '#3b82f6' },
        { label: '연기', data: labels.map(w => map[w].delayed), backgroundColor: '#f59e0b' },
        { label: '미이행', data: labels.map(w => map[w].not), backgroundColor: '#ef4444' },
      ]
    };
  })();

  // Chart 6: 감정 추이 그래프
  const tagDurationBox = useMemo(() => {
    const map: Record<string, number[]> = {};
    tasks.forEach(({ tag, duration }) => {
      if (!map[tag]) map[tag] = [];
      map[tag].push(duration);
    });
    const labels = Object.keys(map);
    const data = labels.map(tag => {
      const values = map[tag].sort((a, b) => a - b);
      const min = values[0];
      const max = values[values.length - 1];
      const q1 = values[Math.floor(values.length * 0.25)];
      const median = values[Math.floor(values.length * 0.5)];
      const q3 = values[Math.floor(values.length * 0.75)];
      return { min, max, q1, median, q3 };
    });
    return { labels, data };
  }, [tasks]);

  // Chart 6: 태그별 총 소요시간
  const durationByTag = (() => {
    const map: Record<string, number> = {};
    tasks.forEach(({ tag, duration }) => {
      map[tag] = (map[tag] || 0) + duration;
    });
    const labels = Object.keys(map);
    const data = labels.map(t => map[t]);
    return { labels, data };
  })();

  // Chart 7: 상태 파이차트
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(({ status }) => {
      map[status] = (map[status] || 0) + 1;
    });
    const labels = Object.keys(map);
    const data = labels.map(l => map[l]);
    return {
      labels,
      datasets: [
        {
          label: '상태 분포',
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        },
      ],
    };
  }, [tasks]);

  // Chart 8: 누적 완료 추이
  const cumulativeCompletion = useMemo(() => {

    const sorted = [...tasks]
      .filter(t => t.status === 'completed')
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    const map: Record<string, number> = {};
    let cumulative = 0;
    sorted.forEach(({ date }) => {
      cumulative++;
      map[date] = cumulative;
    });

    const labels = Object.keys(map);
    const data = Object.values(map);
    return {
      labels,
      datasets: [
        {
          label: '누적 완료건수',
          data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          tension: 0.4,
        },
      ],
    };
  }, [tasks]);

  // Chart 5: 소요시간 vs 감정
  const scatterROI = tasks.map(({ duration, emotion }) => ({ x: duration, y: emotion }));

  // Chart 9: 시간대별 집중도 면적그래프
  const focusByHour = useMemo(() => {
    const map: Record<number, number> = {};
    tasks.forEach(({ start_time }) => {
      const hour = new Date(start_time).getHours();
      map[hour] = (map[hour] || 0) + 1;
    });
    const sortedHours = Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b);
    return {
      labels: sortedHours.map(h => `${h}시`),
      datasets: [
        {
          label: '시간대별 집중도',
          data: sortedHours.map(h => map[h]),
          fill: true,
          backgroundColor: 'rgba(96, 165, 250, 0.3)',
          borderColor: '#60a5fa',
          tension: 0.4,
        },
      ],
    };
  }, [tasks]);
  
  return (
    <>
      {/* 3x3 그리드: 9개 개인 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 일별 이행률 (선그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">일별 이행률</div>
          <div className="flex-1 flex items-center">
            <Line data={{ labels: dailyCompletion.labels, datasets: [{ label: '완료율 %', data: dailyCompletion.data, borderColor: '#3b82f6' }] }} options={{
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { min: 0, max: 100, title: { display: true, text: '이행률(%)' } }
                  },
                  maintainAspectRatio: false,
                }} />
          </div>
        </div>

        {/* 2. 요일×시간대 히트맵 (커스텀) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">요일×시간대 완료율</div>
          {/* 히트맵: 커스텀 렌더링 */}
          <div className="flex">
            <div className="flex flex-col justify-center mr-2">
              {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
                <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
              ))}
            </div>
            <div className="flex flex-col">
              {[[80,70,60,50,40,30,20],[75,85,65,55,45,35,25],[90,80,70,60,50,40,30],[85,75,65,55,45,35,25],[70,60,50,40,30,20,10]].map((row,i) => (
                <div key={i} className="flex mb-1 last:mb-0">
                  {row.map((val,j) => {
                    let color = 'bg-blue-50';
                    if(val>=80) color='bg-blue-700';
                    else if(val>=70) color='bg-blue-500';
                    else if(val>=60) color='bg-blue-300';
                    else if(val>=50) color='bg-blue-100';
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

        {/* 3. 태그별 완료율 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">태그별 완료율</div>
          <Bar
            data={{
              labels: tagStats.labels,
              datasets: [{
                label: '완료율(%)',
                data: tagStats.data,
                // backgroundColor: ['#3b82f6','#f59e42','#10b981','#6366f1'],
                backgroundColor: '#60a5fa',
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { min: 0, max: 100, title: { display: true, text: '완료율(%)' } } },
            }}
            height={180}
          />
        </div>
        {/* 4. 소요시간 히스토그램 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">소요시간 분포</div>
          {/* 히스토그램: 막대그래프로 대체 */}
          <Bar
            data={{
              labels: durationHistogram.labels,
              datasets: [{
                label: '건수',
                data: durationHistogram.data,
                backgroundColor: '#6366f1',
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '건수' } } },
            }}
            height={180}
          />
        </div>

        {/* 5. 소요시간 vs 감정 (산점도) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">소요시간 vs 감정</div>
          <Scatter
            data={{ datasets: [{ data: scatterROI, backgroundColor: '#8b5cf6' }] }}
            options={{
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: '소요시간(분)' } },
                y: { min: 0, max: 5, title: { display: true, text: '감정점수' } },
              },
            }}
            height={180}
          />
        </div>


        {/* 6. 태그별 소요시간 (박스플롯) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">태그별 소요시간</div>
          <Bar
            data={{
              labels: tagDurationBox.labels,
              datasets: [
                {
                  label: '소요시간 분포 (분)',
                  data: tagDurationBox.data,
                  backgroundColor: '#3b82f6',
                },
              ]
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '소요시간(분)' } } },
            }}
            height={180}
          />
        </div>


        {/* 7. 상태 파이차트 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">상태 비율</div>
          <div className="w-[270px] h-[270px] flex justify-center">
            <Doughnut
              data={statusCounts}
              height={120}
            />
          </div>
        </div>


        {/* 8. 누적 완료 영역차트 (Line+fill) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">누적 완료 추이</div>
          <Line
            data={cumulativeCompletion}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '누적 완료' } } },
            }}
            height={180}
          />
        </div>

        
        {/* 9. 시간대별 집중도 (면적그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 집중도</div>
          <Line
            data={focusByHour}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
            }}
            height={180}
          />
        </div>
      </div>
    </>
  );
} 