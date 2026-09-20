import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, RefreshCw, ChevronDown, ChevronUp, CheckCircle2,
  Clock, Zap, Target, X, MessageSquare, Lightbulb,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateRoadmap, updateProgress, submitFeedback, explainResource } from '../api/client';
import ResourceCard from '../components/ResourceCard';
import ProgressRing from '../components/ProgressRing';
import type { Resource } from '../types';

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { userId, profile, roadmap, setRoadmap, isGenerating, setGenerating } = useStore();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-1']));
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [explainModal, setExplainModal] = useState<{ resource: Resource; text: string } | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userId) return;
    setGenerating(true);
    setError('');
    try {
      const generated = await generateRoadmap(userId);
      setRoadmap(generated);
      // Expand first phase by default
      if (generated.phases.length > 0) {
        setExpandedPhases(new Set([generated.phases[0].id]));
      }
    } catch {
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePhase = (id: string) => {
    const s = new Set(expandedPhases);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedPhases(s);
  };

  const toggleMilestone = (id: string) => {
    const s = new Set(expandedMilestones);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedMilestones(s);
  };

  const handleToggleComplete = async (phaseId: string, milestoneId: string, resourceId: string, completed: boolean) => {
    if (!userId) return;
    try {
      const updated = await updateProgress(userId, phaseId, milestoneId, resourceId, completed);
      setRoadmap(updated);
    } catch { /* silent */ }
  };

  const handleFeedback = async (phaseId: string, milestoneId: string, resourceId: string, rating: number) => {
    if (!userId) return;
    await submitFeedback(userId, phaseId, milestoneId, resourceId, rating);
  };

  const handleExplain = async (resource: Resource) => {
    if (!userId) return;
    setLoadingExplain(true);
    setExplainModal({ resource, text: '' });
    try {
      const text = await explainResource(userId, resource);
      setExplainModal({ resource, text });
    } catch {
      setExplainModal({ resource, text: 'Unable to generate explanation. Please try again.' });
    } finally {
      setLoadingExplain(false);
    }
  };

  // Empty state
  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Map className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">No Learning Path Yet</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Chat with LearnAI to share your goals, then generate your personalized roadmap here — or jump straight in.
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary py-3 px-6 text-base"
          >
            {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" /> Generating…</> : <><Zap className="w-5 h-5" /> Generate My Roadmap</>}
          </button>
          <button onClick={() => navigate('/chat')} className="btn-secondary py-3 px-6 text-base">
            <MessageSquare className="w-5 h-5" /> Chat with AI First
          </button>
        </div>
      </div>
    );
  }

  // Stats
  let totalResources = 0;
  let completedResources = 0;
  roadmap.phases.forEach((p) => p.milestones.forEach((m) => m.resources.forEach((r) => {
    totalResources++;
    if (r.completed) completedResources++;
  })));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">Learning Goal</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{roadmap.goal}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {roadmap.totalDuration}</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Est. completion: {roadmap.estimatedCompletion}</span>
            <span>{roadmap.phases.length} phases · {totalResources} resources</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={roadmap.overallProgress} size={80} label="Overall" />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-secondary py-2"
            title="Regenerate roadmap"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Skills to gain */}
      {roadmap.skillsToGain.length > 0 && (
        <div className="card p-4 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-600 mr-1">Skills you'll gain:</span>
          {roadmap.skillsToGain.map((s) => (
            <span key={s} className="badge bg-accent-50 text-accent-700 border border-accent-100">{s}</span>
          ))}
        </div>
      )}

      {/* Phase timeline */}
      <div className="space-y-4">
        {roadmap.phases.map((phase, phaseIdx) => {
          const phaseResources = phase.milestones.flatMap((m) => m.resources);
          const phaseCompleted = phaseResources.filter((r) => r.completed).length;
          const phaseProgress = phaseResources.length > 0
            ? Math.round((phaseCompleted / phaseResources.length) * 100)
            : 0;
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <div key={phase.id} className="card overflow-hidden">
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Phase number */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  phaseProgress === 100 ? 'bg-accent-500 text-white' : 'bg-primary-100 text-primary-700'
                }`}>
                  {phaseProgress === 100 ? <CheckCircle2 className="w-5 h-5" /> : phaseIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-slate-800">{phase.title}</h2>
                    {phase.skills.slice(0, 4).map((s) => (
                      <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{phase.description}</p>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${phaseProgress === 100 ? 'bg-accent-500' : 'bg-primary-500'}`}
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{phaseProgress}%</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
              </button>

              {/* Phase content */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4 animate-fade-in">
                  {phase.milestones.map((milestone) => {
                    const msExpanded = expandedMilestones.has(milestone.id) || true; // Default expanded
                    const msCompleted = milestone.resources.every((r) => r.completed);

                    return (
                      <div key={milestone.id} className="border border-slate-100 rounded-xl overflow-hidden">
                        {/* Milestone header */}
                        <button
                          onClick={() => toggleMilestone(milestone.id)}
                          className="w-full flex items-center gap-3 p-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            msCompleted ? 'bg-accent-500 border-accent-500' : 'border-slate-300'
                          }`}>
                            {msCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${msCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {milestone.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{milestone.description}</p>
                          </div>
                          <span className="text-xs text-slate-400">{milestone.resources.length} resources</span>
                          {msExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Resources */}
                        {msExpanded && (
                          <div className="p-3 space-y-2 bg-white">
                            {milestone.resources.map((resource) => (
                              <ResourceCard
                                key={resource.id}
                                resource={resource}
                                phaseId={phase.id}
                                milestoneId={milestone.id}
                                onToggleComplete={handleToggleComplete}
                                onFeedback={handleFeedback}
                                onExplain={handleExplain}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explain modal */}
      {explainModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-slate-800">Why this recommendation?</h3>
              </div>
              <button onClick={() => setExplainModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-800 mb-3">{explainModal.resource.title}</p>
            {loadingExplain ? (
              <div className="flex gap-1 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="typing-dot w-2 h-2 bg-primary-400 rounded-full" style={{ animationDelay: `${i * 0.16}s` }} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{explainModal.text}</p>
            )}
            <div className="mt-5 flex justify-end">
              <button onClick={() => setExplainModal(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
