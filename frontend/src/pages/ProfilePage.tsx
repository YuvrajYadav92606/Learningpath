import { useState } from 'react';
import { Save, Plus, X, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { updateProfile, addSkill } from '../api/client';
import type { LearnerProfile } from '../types';

const INTEREST_OPTIONS = [
  'Web Development', 'Data Science', 'Machine Learning', 'AI/GenAI',
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'Mobile Development',
  'UI/UX Design', 'Game Development', 'Blockchain', 'Mathematics',
  'Business', 'Product Management', 'Digital Marketing', 'Python',
  'JavaScript', 'React', 'Node.js', 'Deep Learning',
];

const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LEARNING_STYLES = ['visual', 'reading', 'project-based', 'mixed'] as const;

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { userId, profile, setProfile } = useStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(30);
  const [error, setError] = useState('');

  if (!profile) return null;

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile(userId, {
        interests: profile.interests,
        experienceLevel: profile.experienceLevel,
        goals: profile.goals,
        learningStyle: profile.learningStyle,
        weeklyHours: profile.weeklyHours,
        completedCourses: profile.completedCourses,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const list = profile.interests.includes(interest)
      ? profile.interests.filter((i) => i !== interest)
      : [...profile.interests, interest];
    setProfile({ ...profile, interests: list });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setProfile({ ...profile, goals: [...profile.goals, newGoal.trim()] });
    setNewGoal('');
  };

  const removeGoal = (g: string) =>
    setProfile({ ...profile, goals: profile.goals.filter((x) => x !== g) });

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !userId) return;
    try {
      const updated = await addSkill(userId, newSkill.trim(), newSkillLevel);
      setProfile(updated);
      setNewSkill('');
      setNewSkillLevel(30);
    } catch {
      setError('Failed to add skill.');
    }
  };

  const removeSkill = (name: string) =>
    setProfile({ ...profile, skills: profile.skills.filter((s) => s.name !== name) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learner Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            The more detail you provide, the more personalized your roadmap will be.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : saving ? (
            'Saving…'
          ) : (
            <><Save className="w-4 h-4" /> Save Profile</>
          )}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>}

      {/* Basic info */}
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              className="input"
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      {/* Experience + Learning style */}
      <SectionCard title="Learning Preferences">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
            <div className="flex gap-2">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setProfile({ ...profile, experienceLevel: lvl })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    profile.experienceLevel === lvl
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Learning Style</label>
            <div className="grid grid-cols-2 gap-2">
              {LEARNING_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setProfile({ ...profile, learningStyle: style })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    profile.learningStyle === style
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Weekly Hours Available: <span className="text-primary-600 font-semibold">{profile.weeklyHours}h</span>
          </label>
          <input
            type="range"
            min={1} max={40} value={profile.weeklyHours}
            onChange={(e) => setProfile({ ...profile, weeklyHours: Number(e.target.value) })}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1h (minimal)</span>
            <span>20h (part-time)</span>
            <span>40h (full-time)</span>
          </div>
        </div>
      </SectionCard>

      {/* Goals */}
      <SectionCard title="Learning Goals">
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.goals.map((g) => (
            <Tag key={g} label={g} onRemove={() => removeGoal(g)} />
          ))}
          {profile.goals.length === 0 && (
            <p className="text-sm text-slate-400">No goals set yet. Add some below!</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="e.g. Become a full-stack developer"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button onClick={addGoal} className="btn-primary">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </SectionCard>

      {/* Interests */}
      <SectionCard title="Interests & Topics">
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = profile.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selected
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
                }`}
              >
                {selected && '✓ '}{interest}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Current Skills">
        {profile.skills.length > 0 && (
          <div className="space-y-2 mb-4">
            {profile.skills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-28 flex-shrink-0">{skill.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{skill.level}%</span>
                <button onClick={() => removeSkill(skill.name)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-slate-500 mb-1">Skill name</label>
            <input className="input" placeholder="e.g. Python" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
          </div>
          <div className="w-32">
            <label className="block text-xs text-slate-500 mb-1">Level: {newSkillLevel}%</label>
            <input
              type="range" min={5} max={100} value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
          </div>
          <button onClick={handleAddSkill} className="btn-primary self-end">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
