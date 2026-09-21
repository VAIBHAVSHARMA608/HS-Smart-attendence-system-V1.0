const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Get all chat messages
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    console.error('Fetch chats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Post a new chat message
router.post('/', async (req, res) => {
  try {
    const { fromRole, fromName, message } = req.body;
    if (!fromRole || !fromName || !message) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const chat = new Chat({ fromRole, fromName, message });
    await chat.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Post chat error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
