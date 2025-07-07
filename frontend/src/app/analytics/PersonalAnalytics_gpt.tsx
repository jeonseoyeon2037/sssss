// ✅ 프론트엔드: PersonalAnalytics.tsx (Next.js 클라이언트)
'use client';

import { useEffect, useState } from 'react';
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

  const statusCounts = (() => {
    const map: Record<string, number> = {};
    tasks.forEach(({ status }) => {
      map[status] = (map[status] || 0) + 1;
    });
    return map;
  })();

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

  const emotionTrend = (() => {
    const dateMap: Record<string, number[]> = {};
    tasks.forEach(({ date, emotion }) => {
      if (!dateMap[date]) dateMap[date] = [];
      dateMap[date].push(emotion);
    });
    const labels = Object.keys(dateMap);
    const data = labels.map(date => Math.round(dateMap[date].reduce((a, b) => a + b, 0) / dateMap[date].length));
    return { labels, data };
  })();

  const scatterROI = tasks.map(({ duration, emotion }) => ({ x: duration, y: emotion }));

  const durationByTag = (() => {
    const map: Record<string, number> = {};
    tasks.forEach(({ tag, duration }) => {
      map[tag] = (map[tag] || 0) + duration;
    });
    const labels = Object.keys(map);
    const data = labels.map(t => map[t]);
    return { labels, data };
  })();

  const emotionByTimeBlock = (() => {
    const blocks = ['08-10', '10-12', '12-14', '14-16', '16-18'];
    const map: Record<string, number[]> = {};
    tasks.forEach(({ start_time, emotion }) => {
      const hour = dayjs(start_time).hour();
      const blockIdx = Math.floor((hour - 8) / 2);
      if (blockIdx >= 0 && blockIdx < blocks.length) {
        const block = blocks[blockIdx];
        if (!map[block]) map[block] = [];
        map[block].push(emotion);
      }
    });
    const labels = blocks;
    const data = labels.map(b => map[b]?.length ? Math.round(map[b].reduce((a, b) => a + b) / map[b].length) : 0);
    return { labels, data };
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">1. 일별 완료율</h2>
        <Line data={{ labels: dailyCompletion.labels, datasets: [{ label: '완료율 %', data: dailyCompletion.data, borderColor: '#3b82f6' }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">2. 요일×시간대 완료율</h2>
        <div className="flex">
          <div className="flex flex-col justify-center mr-2">
            {['08-10','10-12','12-14','14-16','16-18'].map((block) => (
              <div key={block} className="h-9 flex items-center justify-end text-[#7b8794] text-sm" style={{height:36}}>{block}</div>
            ))}
          </div>
          <div className="flex flex-col">
            {timeHeatmap.map((row,i) => (
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

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">3. 태그별 완료율</h2>
        <Bar data={{ labels: tagStats.labels, datasets: [{ label: '완료율 %', data: tagStats.data, backgroundColor: '#60a5fa' }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">4. 상태 분포</h2>
        <Doughnut data={{ labels: Object.keys(statusCounts), datasets: [{ label: '건수', data: Object.values(statusCounts), backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'] }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">5. 주간 이행·연기·미이행</h2>
        <Bar options={{ responsive: true, plugins: { legend: { position: 'top' } } }} data={weeklyStacked} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">6. 감정 점수 추이</h2>
        <Line data={{ labels: emotionTrend.labels, datasets: [{ label: '감정 점수', data: emotionTrend.data, borderColor: '#10b981' }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">7. 소요시간 vs 감정</h2>
        <Scatter data={{ datasets: [{ label: '시간 vs 감정', data: scatterROI, backgroundColor: '#8b5cf6' }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">8. 태그별 총 소요시간</h2>
        <Bar data={{ labels: durationByTag.labels, datasets: [{ label: '소요시간 (분)', data: durationByTag.data, backgroundColor: '#3b82f6' }] }} />
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-[#22223b]">9. 시간대별 평균 감정 점수</h2>
        <Line data={{ labels: emotionByTimeBlock.labels, datasets: [{ label: '평균 감정 점수', data: emotionByTimeBlock.data, borderColor: '#f43f5e' }] }} />
      </div>
    </div>
  );
}
