const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Get all chat messages
router.get('/', async (req, res) => {
  const chats = await Chat.find().sort({ timestamp: 1 });
  res.json(chats);
});

// Post a new chat message
router.post('/', async (req, res) => {
  const { fromRole, fromName, message } = req.body;
  const chat = new Chat({ fromRole, fromName, message });
  await chat.save();
  res.json({ success: true });
});

module.exports = router;