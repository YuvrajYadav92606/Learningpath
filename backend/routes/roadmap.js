import express from 'express';
import User from '../models/User.js';
import LearningPath from '../models/LearningPath.js';
import { generateLearningPath, explainRecommendation } from '../services/geminiService.js';

const router = express.Router();

// POST /api/roadmap/generate
router.post('/generate', async (req, res) => {
  try {
    const { userId, goal } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resolvedGoal = goal || (user.goals[0]) || 'Become a proficient developer';

    // Generate via Gemini
    const pathData = await generateLearningPath(resolvedGoal, user.toObject());

    // Upsert learning path
    const learningPath = await LearningPath.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          goal: pathData.goal || resolvedGoal,
          phases: pathData.phases || [],
          totalDuration: pathData.totalDuration || '',
          estimatedCompletion: pathData.estimatedCompletion || '',
          skillsToGain: pathData.skillsToGain || [],
          prerequisites: pathData.prerequisites || [],
          overallProgress: 0,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ roadmap: learningPath.toObject() });
  } catch (err) {
    console.error('Generate roadmap error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmap/:userId
router.get('/:userId', async (req, res) => {
  try {
    const roadmap = await LearningPath.findOne({ userId: req.params.userId });
    res.json({ roadmap: roadmap ? roadmap.toObject() : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/roadmap/:userId/progress — mark a resource complete/incomplete
router.put('/:userId/progress', async (req, res) => {
  try {
    const { phaseId, milestoneId, resourceId, completed } = req.body;
    const roadmap = await LearningPath.findOne({ userId: req.params.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    let found = false;
    for (const phase of roadmap.phases) {
      if (phase.id !== phaseId) continue;
      for (const milestone of phase.milestones) {
        if (milestone.id !== milestoneId) continue;
        for (const resource of milestone.resources) {
          if (resource.id !== resourceId) continue;
          resource.completed = completed;
          resource.completedAt = completed ? new Date() : undefined;
          found = true;
        }
        // Auto-complete milestone if all resources done
        milestone.completed = milestone.resources.every((r) => r.completed);
        if (milestone.completed && !milestone.completedAt) milestone.completedAt = new Date();
      }
    }

    if (!found) return res.status(404).json({ error: 'Resource not found' });

    await roadmap.save(); // triggers overallProgress pre-save hook
    res.json({ roadmap: roadmap.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/roadmap/:userId/feedback — rate a resource
router.post('/:userId/feedback', async (req, res) => {
  try {
    const { phaseId, milestoneId, resourceId, rating, feedback } = req.body;
    const roadmap = await LearningPath.findOne({ userId: req.params.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    for (const phase of roadmap.phases) {
      if (phase.id !== phaseId) continue;
      for (const milestone of phase.milestones) {
        if (milestone.id !== milestoneId) continue;
        for (const resource of milestone.resources) {
          if (resource.id !== resourceId) continue;
          if (rating) resource.rating = rating;
          if (feedback) resource.feedback = feedback;
        }
      }
    }

    roadmap.markModified('phases');
    await roadmap.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/roadmap/explain — explain a single recommendation
router.post('/explain', async (req, res) => {
  try {
    const { userId, resource } = req.body;
    if (!userId || !resource) return res.status(400).json({ error: 'userId and resource required' });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const explanation = await explainRecommendation(resource, user.toObject());
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
