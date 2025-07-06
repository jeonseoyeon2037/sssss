export default function PertNetworkChart() {
  // 원형 배치용 더미 부서 데이터
  const departments = [
    { label: '영업팀', color: '#60a5fa' },
    { label: '기획팀', color: '#fbbf24' },
    { label: '개발팀', color: '#34d399' },
    { label: 'QA팀', color: '#a78bfa' },
    { label: '배포팀', color: '#f87171' },
    { label: 'CS팀', color: '#38bdf8' },
  ];
  const centerX = 210, centerY = 100, radius = 70;
  // 원형 좌표 계산
  const nodes = departments.map((d, i) => {
    const angle = (2 * Math.PI * i) / departments.length - Math.PI/2;
    return {
      ...d,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      id: i,
    };
  });
  // 여러 업무 흐름(화살표)
  const links = [
    { from: 0, to: 1 }, // 영업→기획
    { from: 0, to: 2 }, // 영업→개발
    { from: 1, to: 2 }, // 기획→개발
    { from: 2, to: 3 }, // 개발→QA
    { from: 3, to: 4 }, // QA→배포
    { from: 2, to: 5 }, // 개발→CS
    { from: 5, to: 3 }, // CS→QA
  ];
  return (
    <svg width={420} height={200} style={{ background: '#f8fafc', borderRadius: 12 }}>
      {/* Links (arrows) */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
        </marker>
      </defs>
      {links.map((l, i) => {
        const from = nodes[l.from];
        const to = nodes[l.to];
        // 곡선 화살표(중앙 각도 차이로 곡률 조정)
        const dx = to.x - from.x, dy = to.y - from.y;
        const dr = Math.sqrt(dx*dx + dy*dy) * 1.2;
        const sweep = (l.from < l.to) ? 0 : 1;
        return (
          <path
            key={i}
            d={`M${from.x},${from.y} A${dr},${dr} 0 0,${sweep} ${to.x},${to.y}`}
            stroke="#38bdf8"
            strokeWidth={2}
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity={0.85}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={28} fill={n.color+"22"} stroke={n.color} strokeWidth={2} />
          <text x={n.x} y={n.y} textAnchor="middle" alignmentBaseline="middle" fontSize="15" fill={n.color} fontWeight="bold">{n.label}</text>
        </g>
      ))}
    </svg>
  );
} 