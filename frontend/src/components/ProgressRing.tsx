interface Props {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  className?: string;
}

export default function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = '#3b62f7',
  label,
  className = '',
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{value}%</span>
        {label && <span className="text-[10px] text-slate-500 leading-tight text-center">{label}</span>}
      </div>
    </div>
  );
}
