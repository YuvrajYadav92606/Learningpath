import { useState } from 'react';
import {
  ExternalLink, Clock, BarChart2, CheckCircle, Star, ChevronDown, ChevronUp,
  BookOpen, Wrench, HelpCircle, FileText, Play, Lightbulb, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import type { Resource } from '../types';

const typeConfig = {
  course: { icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Course' },
  project: { icon: Wrench, color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'Project' },
  quiz: { icon: HelpCircle, color: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Quiz' },
  article: { icon: FileText, color: 'bg-green-50 text-green-700 border-green-100', label: 'Article' },
  video: { icon: Play, color: 'bg-red-50 text-red-700 border-red-100', label: 'Video' },
};

const difficultyColor = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-red-50 text-red-700',
};

interface Props {
  resource: Resource;
  phaseId: string;
  milestoneId: string;
  onToggleComplete: (phaseId: string, milestoneId: string, resourceId: string, completed: boolean) => void;
  onFeedback: (phaseId: string, milestoneId: string, resourceId: string, rating: number) => void;
  onExplain: (resource: Resource) => void;
}

export default function ResourceCard({
  resource, phaseId, milestoneId, onToggleComplete, onFeedback, onExplain,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[resource.type] || typeConfig.course;
  const Icon = config.icon;

  return (
    <div
      className={`card p-4 transition-all duration-200 ${
        resource.completed ? 'opacity-75 bg-slate-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          onClick={() => onToggleComplete(phaseId, milestoneId, resource.id, !resource.completed)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            resource.completed
              ? 'bg-accent-500 border-accent-500'
              : 'border-slate-300 hover:border-primary-500'
          }`}
        >
          {resource.completed && <CheckCircle className="w-3.5 h-3.5 text-white fill-current" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4
              className={`font-semibold text-sm leading-snug ${
                resource.completed ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              {resource.title}
            </h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`badge border ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </span>
              <span className={`badge ${difficultyColor[resource.difficulty]}`}>
                {resource.difficulty}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {resource.duration}
            </span>
            {resource.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {resource.rating}/5
              </span>
            )}
            {resource.skills.slice(0, 3).map((s) => (
              <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>
            ))}
          </div>

          {/* Description (collapsed/expanded) */}
          {expanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
              {resource.whyRecommended && (
                <div className="flex gap-2 bg-primary-50 border border-primary-100 rounded-lg p-2.5">
                  <Lightbulb className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary-800 leading-relaxed">{resource.whyRecommended}</p>
                </div>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-1 px-2.5 text-xs"
              >
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-secondary py-1 px-2.5 text-xs"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>
            <button
              onClick={() => onExplain(resource)}
              className="btn-secondary py-1 px-2.5 text-xs"
            >
              <BarChart2 className="w-3 h-3" /> Why this?
            </button>

            {/* Rating */}
            {resource.completed && !resource.rating && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-slate-400 mr-1">Rate:</span>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => onFeedback(phaseId, milestoneId, resource.id, r)}
                    className="text-slate-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
