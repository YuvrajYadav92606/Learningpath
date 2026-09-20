import express from 'express';
import User from '../models/User.js';
import { chatWithContext } from '../services/geminiService.js';

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { userId, message, conversationHistory = [] } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Build messages array: history + new user message
    const messages = [
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Call Gemini
    const { reply, actions } = await chatWithContext(messages, user.toObject());

    // Persist conversation turn to DB (keep last 40 messages)
    user.conversationHistory.push({ role: 'user', content: message });
    user.conversationHistory.push({ role: 'assistant', content: reply });
    if (user.conversationHistory.length > 40) {
      user.conversationHistory = user.conversationHistory.slice(-40);
    }

    // Apply any profile update actions
    for (const action of actions) {
      if (action.type === 'UPDATE_PROFILE' && action.data) {
        const { experienceLevel, learningStyle, weeklyHours, interests, goals } = action.data;
        if (experienceLevel) user.experienceLevel = experienceLevel;
        if (learningStyle) user.learningStyle = learningStyle;
        if (weeklyHours) user.weeklyHours = weeklyHours;
        if (interests) user.interests = [...new Set([...user.interests, ...interests])];
        if (goals) user.goals = [...new Set([...user.goals, ...goals])];
      }
    }

    user.lastActive = new Date();
    await user.save();

    res.json({
      reply,
      actions,
      profile: user.toObject(),
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/:userId/history
router.get('/:userId/history', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ history: user.conversationHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/:userId/history — clear conversation
router.delete('/:userId/history', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { conversationHistory: [] } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
