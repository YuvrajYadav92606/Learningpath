import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { Skill } from '../types';

interface Props {
  skills: Skill[];
}

export default function SkillRadar({ skills }: Props) {
  if (!skills || skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
        <p>No skills tracked yet.</p>
        <p className="text-xs mt-1">Complete resources to build your skill radar.</p>
      </div>
    );
  }

  const data = skills.slice(0, 8).map((s) => ({
    skill: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    level: s.level,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Radar
          name="Skill Level"
          dataKey="level"
          stroke="#3b62f7"
          fill="#3b62f7"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Proficiency']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
