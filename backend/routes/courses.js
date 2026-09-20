import express from 'express';
import { courses } from '../data/courses.js';

const router = express.Router();

// GET /api/courses — optionally filter by domain or level
router.get('/', (req, res) => {
  const { domain, level, search } = req.query;
  let result = [...courses];

  if (domain) {
    result = result.filter((c) => c.domain.toLowerCase().includes(domain.toLowerCase()));
  }
  if (level) {
    result = result.filter((c) => c.level === level);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  const domains = [...new Set(courses.map((c) => c.domain))].sort();
  res.json({ courses: result, total: result.length, domains });
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const course = courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ course });
});

export default router;
