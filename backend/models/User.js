import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 10 },
});

const ConversationMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    interests: { type: [String], default: [] },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    goals: { type: [String], default: [] },
    completedCourses: { type: [String], default: [] },
    learningStyle: {
      type: String,
      enum: ['visual', 'reading', 'project-based', 'mixed'],
      default: 'mixed',
    },
    weeklyHours: { type: Number, default: 5 },
    skills: { type: [SkillSchema], default: [] },
    conversationHistory: { type: [ConversationMessageSchema], default: [] },
    streak: { type: Number, default: 0 },
    totalHoursLearned: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
