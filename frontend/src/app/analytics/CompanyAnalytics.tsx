'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
// import SankeyDiagram from './SankeyDiagram';
import { Chart as GoogleChart } from 'react-google-charts';

// ForceGraph2D를 동적 import로 변경하여 SSR 오류 방지
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">네트워크 그래프 로딩 중...</div>
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// CompanyScheduleAnalysis 스키마에 맞는 인터페이스
interface CompanyScheduleAnalysis {
  schedule_id: string;                                    // 회사 일정 고유 아이디
  analysis_start_date: string;                           // 분석 기간 시작일
  analysis_end_date: string;                             // 분석 기간 종료일
  total_schedules: number;                               // 총 일정 건수
  schedule_duration_distribution: Record<string, number>; // 일정 기간별 분포
  time_slot_distribution: Record<string, number>;        // 시간대별 분포
  attendee_participation_counts: Record<string, number>; // 참석자별 참여 횟수
  organizer_schedule_counts: Record<string, number>;     // 주최 기관별 일정 수
  supporting_organization_collaborations: Record<string, string[]>; // 협조 기관별 협력 횟수
  monthly_schedule_counts: Record<string, number>;       // 월별 일정 건수 추이
  schedule_category_ratio: Record<string, number>;       // 일정 카테고리별 비율
  updated_at: string;                                    // 갱신 일시
}

export default function CompanyAnalytics() {
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyScheduleAnalysis[]>([]);

  const getRecent6Months = () => {
    const arr: string[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      arr.push(now.subtract(i, 'month').format('M월'));
    }
    return arr;
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/companyTasks')
      .then(res => res.json())
      .then((data: CompanyScheduleAnalysis[]) => {
        // 데이터가 배열인지 확인하고 설정
        const analysisArray = Array.isArray(data) ? data : [];
        setCompanyAnalysis(analysisArray);
      })
      .catch(console.error);
  }, []);

  // 첫 번째 분석 데이터 가져오기 (가장 최근 데이터)
  const firstData = useMemo(() => {
    if (!Array.isArray(companyAnalysis) || companyAnalysis.length === 0) {
      return null;
    }
    return companyAnalysis[0];
  }, [companyAnalysis]);

  //1. 일정 기간별 분포 (파이차트)
  const durationDistribution = useMemo(() => {
    if (!firstData || !firstData.schedule_duration_distribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.schedule_duration_distribution);
    const data = Object.values(firstData.schedule_duration_distribution);

    return {
      labels,
      datasets: [
        {
          label: '일정 기간별 분포',
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
        },
      ],
    };
  }, [firstData]);

  //2. 시간대별 분포 (막대그래프)
  const timeSlotDistribution = useMemo(() => {
    if (!firstData || !firstData.time_slot_distribution) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.time_slot_distribution);
    const data = Object.values(firstData.time_slot_distribution);

    return {
      labels,
      datasets: [
        {
          label: '시간대별 일정 수',
          data,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [firstData]);

  //3. 참석자별 참여 횟수 (막대그래프)
  const attendeeParticipation = useMemo(() => {
    if (!firstData || !firstData.attendee_participation_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.attendee_participation_counts);
    const data = Object.values(firstData.attendee_participation_counts);

    return {
      labels,
      datasets: [
        {
          label: '참여 횟수',
          data,
          backgroundColor: '#10b981',
        },
      ],
    };
  }, [firstData]);

  //4. 협조 기관 네트워크 그래프
  const collaborationNetwork = useMemo(() => {
    if (!firstData || !firstData.supporting_organization_collaborations) {
      return { nodes: [], links: [] };
    }

    const nodes = new Set<string>();
    const edges: { from: string; to: string }[] = [];

    Object.entries(firstData.supporting_organization_collaborations).forEach(([organization, collaborators]) => {
      nodes.add(organization);
      
      // collaborators가 배열인지 확인하고 안전하게 처리
      if (Array.isArray(collaborators)) {
        collaborators.forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: organization, to: collaborator });
          }
        });
      } else if (typeof collaborators === 'string') {
        // collaborators가 단일 문자열인 경우
        nodes.add(collaborators);
        edges.push({ from: organization, to: collaborators });
      } else if (typeof collaborators === 'object' && collaborators !== null) {
        // collaborators가 객체인 경우
        Object.keys(collaborators).forEach(collaborator => {
          if (typeof collaborator === 'string') {
            nodes.add(collaborator);
            edges.push({ from: organization, to: collaborator });
          }
        });
      }
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id })),
      links: edges.map(e => ({ source: e.from, target: e.to })),
    };
  }, [firstData]);

  //5. 주최 기관별 일정 수 (막대그래프)
  const organizerScheduleCounts = useMemo(() => {
    if (!firstData || !firstData.organizer_schedule_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.organizer_schedule_counts);
    const data = Object.values(firstData.organizer_schedule_counts);

    return {
      labels,
      datasets: [
        {
          label: '일정 수',
          data,
          backgroundColor: '#f59e0b',
        },
      ],
    };
  }, [firstData]);

  //6. 일정 카테고리별 비율 (도넛차트)
  const categoryRatio = useMemo(() => {
    if (!firstData || !firstData.schedule_category_ratio) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.schedule_category_ratio);
    const data = Object.values(firstData.schedule_category_ratio);

    return {
      labels,
      datasets: [
        {
          label: '카테고리별 비율',
          data,
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
        },
      ],
    };
  }, [firstData]);

  //7. 월별 일정 건수 추이 (라인차트)
  const monthlyScheduleCounts = useMemo(() => {
    if (!firstData || !firstData.monthly_schedule_counts) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(firstData.monthly_schedule_counts).sort();
    const data = labels.map(month => firstData.monthly_schedule_counts[month] || 0);

    return {
      labels,
      datasets: [
        {
          label: '월별 일정 건수',
          data,
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
  }, [firstData]);

  //8. 일정 기간 vs 참여자 수 산점도
  const durationVsParticipants = useMemo(() => {
    if (!firstData || !firstData.schedule_duration_distribution || !firstData.attendee_participation_counts) {
      return { datasets: [] };
    }

    const durationKeys = Object.keys(firstData.schedule_duration_distribution);
    const attendeeKeys = Object.keys(firstData.attendee_participation_counts);
    
    // 두 데이터를 매칭하여 산점도 데이터 생성
    const data = durationKeys.map(duration => {
      const durationValue = firstData.schedule_duration_distribution[duration];
      const attendeeValue = firstData.attendee_participation_counts[duration] || 0;
      return {
        x: durationValue,
        y: attendeeValue,
      };
    });

    return {
      datasets: [
        {
          label: '기간 vs 참여자',
          data,
          backgroundColor: '#3b82f6',
          pointRadius: 6,
        },
      ],
    };
  }, [firstData]);

  //9. 총 일정 건수 및 통계 요약 (커스텀 카드)
  const summaryStats = useMemo(() => {
    if (!firstData) {
      return {
        totalSchedules: 0,
        totalAttendees: 0,
        totalOrganizers: 0,
        analysisPeriod: '',
      };
    }

    const totalAttendees = Object.values(firstData.attendee_participation_counts || {}).reduce((sum, count) => sum + count, 0);
    const totalOrganizers = Object.keys(firstData.organizer_schedule_counts || {}).length;
    const analysisPeriod = `${firstData.analysis_start_date} ~ ${firstData.analysis_end_date}`;

    return {
      totalSchedules: firstData.total_schedules || 0,
      totalAttendees,
      totalOrganizers,
      analysisPeriod,
    };
  }, [firstData]);

  return (
    <>
      {/* 3x3 그리드: 9개 회사 일정 분석 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 1. 일정 기간별 분포 (파이차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 기간별 분포</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Pie
              data={durationDistribution}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 2. 시간대별 분포 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">시간대별 일정 분포</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={timeSlotDistribution}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 수' } } },
              }}
            />
          </div>
        </div>

        {/* 3. 참석자별 참여 횟수 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">참석자별 참여 횟수</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={attendeeParticipation}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '참여 횟수' } } },
              }}
            />
          </div>
        </div>

        {/* 4. 협조 기관 네트워크 그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center justify-center min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">협조 기관 네트워크</div>
          <div className="w-full flex-1 flex items-center justify-center" style={{height:250}}>
            <ForceGraph2D
              graphData={collaborationNetwork}
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

        {/* 5. 주최 기관별 일정 수 (막대그래프) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">주최 기관별 일정 수</div>
          <div className="flex-1 flex items-center">
            <Bar
              data={organizerScheduleCounts}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 수' } } },
              }}
            />
          </div>
        </div>

        {/* 6. 일정 카테고리별 비율 (도넛차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col items-center">
          <div className="font-semibold mb-3 text-[#22223b]">일정 카테고리별 비율</div>
          <div className="w-[270px] h-[270px] flex items-center justify-center">
            <Doughnut
              data={categoryRatio}
              options={{
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* 7. 월별 일정 건수 추이 (라인차트) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">월별 일정 건수 추이</div>
          <div className="flex-1 flex items-center">
            <Line
              data={monthlyScheduleCounts}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: '일정 건수' } } },
              }}
            />
          </div>
        </div>

        {/* 8. 일정 기간 vs 참여자 수 산점도 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col min-h-[300px]">
          <div className="font-semibold mb-3 text-[#22223b]">기간 vs 참여자 수</div>
          <div className="flex-1 flex items-center">
            <Scatter
              data={durationVsParticipants}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: '일정 기간' } },
                  y: { title: { display: true, text: '참여자 수' } },
                },
              }}
            />
          </div>
        </div>

        {/* 9. 통계 요약 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex flex-col justify-center">
          <div className="font-semibold mb-4 text-[#22223b] text-center">분석 요약</div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summaryStats.totalSchedules}</div>
              <div className="text-sm text-gray-600">총 일정 건수</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">{summaryStats.totalAttendees}</div>
              <div className="text-sm text-gray-600">총 참석자 수</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-orange-600">{summaryStats.totalOrganizers}</div>
              <div className="text-sm text-gray-600">주최 기관 수</div>
            </div>
            <div className="text-center pt-2 border-t">
              <div className="text-xs text-gray-500">{summaryStats.analysisPeriod}</div>
              <div className="text-xs text-gray-500">분석 기간</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 