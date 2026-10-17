const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const items = await Announcement.find({
      audience: { $in: ['all', req.user.role] },
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireRole('teacher', 'hr', 'md'), async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }
    const item = await Announcement.create({
      title,
      message,
      postedBy: req.user.name,
      postedByRole: req.user.role,
      audience: Array.isArray(audience) && audience.length ? audience : ['all'],
    });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    const canDelete = ['hr', 'md'].includes(req.user.role) || item.postedBy === req.user.name;
    if (!canDelete) return res.status(403).json({ success: false, message: 'Not permitted' });
    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
