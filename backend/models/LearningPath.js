import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['course', 'project', 'quiz', 'article', 'video'],
    default: 'course',
  },
  url: { type: String, default: '' },
  duration: { type: String, default: '1 hour' },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  skills: { type: [String], default: [] },
  description: { type: String, default: '' },
  whyRecommended: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, default: '' },
});

const MilestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resources: { type: [ResourceSchema], default: [] },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const PhaseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true },
  skills: { type: [String], default: [] },
  milestones: { type: [MilestoneSchema], default: [] },
});

const LearningPathSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    goal: { type: String, required: true },
    phases: { type: [PhaseSchema], default: [] },
    totalDuration: { type: String, default: '' },
    estimatedCompletion: { type: String, default: '' },
    skillsToGain: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    overallProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate overallProgress before saving
LearningPathSchema.pre('save', function (next) {
  let total = 0;
  let completed = 0;
  this.phases.forEach((phase) => {
    phase.milestones.forEach((milestone) => {
      milestone.resources.forEach((resource) => {
        total++;
        if (resource.completed) completed++;
      });
    });
  });
  this.overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
  next();
});

export default mongoose.model('LearningPath', LearningPathSchema);
