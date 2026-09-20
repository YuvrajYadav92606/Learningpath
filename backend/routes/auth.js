import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/login  — simple name-based login (creates user if not exists)
router.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let user;

    // If email provided, look up by email; otherwise by name
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }
    if (!user) {
      user = await User.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    }

    if (!user) {
      // New user — create profile
      user = new User({
        userId: uuidv4(),
        name: name.trim(),
        email: email ? email.toLowerCase() : '',
      });
      await user.save();
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    return res.json({
      userId: user.userId,
      profile: user.toObject(),
      isNew: !user.goals.length && !user.interests.length,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
