import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Zap, Map, CheckCircle2, BookOpen, Clock,
  Target, TrendingUp, MessageSquare, ChevronRight,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import SkillRadar from '../components/SkillRadar';
import ProgressRing from '../components/ProgressRing';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, roadmap } = useStore();

  // Compute stats
  let totalResources = 0;
  let completedResources = 0;
  let completedMilestones = 0;
  let totalMilestones = 0;
  const phaseProgress: { name: string; progress: number; color: string }[] = [];

  const phaseColors = ['#3b62f7', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (roadmap) {
    roadmap.phases.forEach((phase, idx) => {
      let pTotal = 0, pCompleted = 0;
      phase.milestones.forEach((m) => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
        m.resources.forEach((r) => {
          totalResources++;
          pTotal++;
          if (r.completed) { completedResources++; pCompleted++; }
        });
      });
      phaseProgress.push({
        name: `Phase ${idx + 1}`,
        progress: pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0,
        color: phaseColors[idx % phaseColors.length],
      });
    });
  }

  const overallProgress = totalResources > 0
    ? Math.round((completedResources / totalResources) * 100)
    : 0;

  // Next recommended resource
  let nextResource: { title: string; type: string; phaseTitle: string } | null = null;
  if (roadmap) {
    outer: for (const phase of roadmap.phases) {
      for (const milestone of phase.milestones) {
        for (const resource of milestone.resources) {
          if (!resource.completed) {
            nextResource = { title: resource.title, type: resource.type, phaseTitle: phase.title };
            break outer;
          }
        }
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {profile?.name?.split(' ')[0] || 'Learner'}! 👋
            </h1>
            <p className="text-primary-200 text-sm">
              {roadmap
                ? `You're ${overallProgress}% through your journey to: ${roadmap.goal}`
                : 'Start your learning journey by chatting with LearnAI.'}
            </p>
          </div>
          {roadmap && <ProgressRing value={overallProgress} size={90} color="#ffffff" className="text-white" />}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Resources Completed"
          value={`${completedResources}/${totalResources}`}
          sub={totalResources > 0 ? `${overallProgress}% done` : 'Generate roadmap to start'}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Target}
          label="Milestones Hit"
          value={`${completedMilestones}/${totalMilestones}`}
          color="bg-primary-500"
        />
        <StatCard
          icon={BookOpen}
          label="Skills Tracked"
          value={profile?.skills.length || 0}
          sub="Update in Profile"
          color="bg-purple-500"
        />
        <StatCard
          icon={Clock}
          label="Weekly Target"
          value={`${profile?.weeklyHours || 5}h`}
          sub="Hours per week"
          color="bg-amber-500"
        />
      </div>

      {/* Main grid: Skill radar + Phase progress + Next action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Radar */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-slate-800">Skill Radar</h2>
          </div>
          <SkillRadar skills={profile?.skills || []} />
          {(!profile?.skills || profile.skills.length === 0) && (
            <div className="text-center mt-3">
              <button onClick={() => navigate('/profile')} className="btn-secondary text-xs py-1.5">
                Add Skills in Profile
              </button>
            </div>
          )}
        </div>

        {/* Phase progress */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-slate-800">Phase Progress</h2>
          </div>
          {phaseProgress.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={phaseProgress} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Progress']} />
                  <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                    {phaseProgress.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {phaseProgress.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-xs text-slate-600 flex-1">{roadmap?.phases[i]?.title || p.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[140px]">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right">{p.progress}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Map className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No roadmap yet</p>
              <button onClick={() => navigate('/roadmap')} className="btn-primary mt-3 py-1.5 text-xs">
                Generate Roadmap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next Action + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next recommended action */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-800">Next Recommended Action</h2>
          </div>
          {nextResource ? (
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-primary-600 font-medium mb-0.5">{nextResource.phaseTitle}</p>
                  <p className="font-semibold text-slate-800 text-sm">{nextResource.title}</p>
                  <span className="badge bg-white border border-slate-200 text-slate-600 mt-1.5 capitalize">
                    {nextResource.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/roadmap')}
                className="btn-primary mt-4 w-full justify-center py-2"
              >
                Open Roadmap <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : roadmap ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-accent-500 mb-3" />
              <p className="font-semibold text-slate-800">All done! 🎉</p>
              <p className="text-sm text-slate-500 mt-1">You've completed all resources in your roadmap.</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-4">Generate your roadmap to see personalized recommendations.</p>
              <button onClick={() => navigate('/chat')} className="btn-primary">
                <MessageSquare className="w-4 h-4" /> Chat with AI
              </button>
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-slate-800">Your Goals</h2>
            </div>
            <button onClick={() => navigate('/profile')} className="text-xs text-primary-600 hover:underline">Edit</button>
          </div>
          {profile?.goals && profile.goals.length > 0 ? (
            <ul className="space-y-2">
              {profile.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary-700">{i + 1}</span>
                  </div>
                  {g}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-3">No goals set yet.</p>
              <button onClick={() => navigate('/chat')} className="btn-secondary text-xs">
                <MessageSquare className="w-3.5 h-3.5" /> Tell AI your goals
              </button>
            </div>
          )}

          {/* Interests pills */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 8).map((interest) => (
                  <span key={interest} className="badge bg-slate-100 text-slate-600">{interest}</span>
                ))}
                {profile.interests.length > 8 && (
                  <span className="badge bg-slate-100 text-slate-500">+{profile.interests.length - 8} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
