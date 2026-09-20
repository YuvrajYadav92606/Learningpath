import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Map, BarChart2, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { login } from '../api/client';
import { getProfile, getRoadmap } from '../api/client';

const features = [
  {
    icon: MessageSquare,
    title: 'Conversational AI',
    desc: 'Describe your goals in plain language. Our AI builds your profile through natural conversation.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Map,
    title: 'Personalized Roadmap',
    desc: 'Get a structured, phase-by-phase learning path with real courses, projects, and milestones.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Skill Gap Analysis',
    desc: 'AI identifies what you already know and what you need to learn to reach your goal.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: BarChart2,
    title: 'Progress Dashboard',
    desc: 'Visual skill radar, phase completion, and your next recommended action — always.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

const domains = [
  'Web Development', 'Data Science', 'Machine Learning & AI',
  'Cybersecurity', 'Cloud & DevOps', 'UI/UX Design',
  'Mobile Apps', 'Game Development', 'Blockchain',
];

export default function LandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setProfile, setRoadmap } = useStore();
  const navigate = useNavigate();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await login(name.trim(), email.trim() || undefined);
      setUser(res.userId, res.isNew);
      setProfile(res.profile);

      // Preload roadmap if exists
      try {
        const roadmap = await getRoadmap(res.userId);
        if (roadmap) setRoadmap(roadmap);
      } catch {}

      navigate('/chat');
    } catch (err: unknown) {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Your personalized{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              learning journey
            </span>{' '}
            starts here
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-10">
            Tell our AI your goals, interests, and experience level. Get a custom roadmap of
            courses, projects, and milestones built specifically for you.
          </p>

          {/* Login form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">LearnAI</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 text-center mb-6">
              Start your learning journey
            </h2>
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email (optional)
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {loading ? 'Connecting…' : (
                  <>Get Started <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
            <p className="text-xs text-slate-400 text-center mt-4">
              No signup or credit card required.
            </p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Domain pills */}
        <div className="text-center mt-20">
          <p className="text-sm font-medium text-slate-500 mb-5 uppercase tracking-wider">
            Covering 12+ domains
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {domains.map((d) => (
              <span key={d} className="badge bg-white border border-slate-200 text-slate-700 px-3 py-1.5 text-sm shadow-sm">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
