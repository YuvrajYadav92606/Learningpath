import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ profile: user.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/:userId — update profile fields
router.put('/:userId', async (req, res) => {
  try {
    const allowed = [
      'name', 'email', 'interests', 'experienceLevel',
      'goals', 'completedCourses', 'learningStyle', 'weeklyHours', 'skills',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { ...updates, lastActive: new Date() } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ profile: user.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile/:userId/skill — add or update a skill
router.post('/:userId/skill', async (req, res) => {
  try {
    const { name, level } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name required' });

    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = user.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.level = level ?? existing.level;
    } else {
      user.skills.push({ name, level: level ?? 10 });
    }
    await user.save();
    res.json({ profile: user.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
