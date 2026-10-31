const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { query } = require('../config/db');
const logger = require('../utils/logger');

// Ensure direct_messages table exists in PostgreSQL
let tableInitialized = false;
const ensureTable = async () => {
  if (tableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL,
        recipient_id UUID NOT NULL,
        sender_name VARCHAR(255),
        recipient_name VARCHAR(255),
        student_name VARCHAR(255),
        text TEXT NOT NULL,
        channel VARCHAR(50) DEFAULT 'teacher_parent',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_direct_messages_participants ON direct_messages(sender_id, recipient_id);
    `);
    tableInitialized = true;
  } catch (err) {
    logger.error(`Error ensuring direct_messages table: ${err.message}`);
  }
};

router.use(authenticate);

// GET /api/messages - fetch all messages for the current authenticated user
router.get('/', async (req, res, next) => {
  try {
    await ensureTable();
    const userId = req.user.id;
    const { recipient_id } = req.query;

    let sql = `
      SELECT 
        id, 
        sender_id, 
        recipient_id, 
        sender_name, 
        recipient_name, 
        student_name, 
        text, 
        channel, 
        created_at
      FROM direct_messages
      WHERE (sender_id = $1 OR recipient_id = $1)
    `;
    const params = [userId];

    if (recipient_id) {
      sql += ` AND (sender_id = $2 OR recipient_id = $2)`;
      params.push(recipient_id);
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await query(sql, params);
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages - send a new message
router.post('/', async (req, res, next) => {
  try {
    await ensureTable();
    const senderId = req.user.id;
    const senderName = [req.user.first_name, req.user.last_name].filter(Boolean).join(' ') || req.user.email || 'User';
    const { recipient_id, recipient_name, student_name, text, channel = 'teacher_parent' } = req.body;

    if (!recipient_id || !text) {
      return res.status(400).json({ status: 'error', message: 'recipient_id and text are required' });
    }

    const insertSql = `
      INSERT INTO direct_messages (sender_id, recipient_id, sender_name, recipient_name, student_name, text, channel, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;
    const result = await query(insertSql, [
      senderId,
      recipient_id,
      senderName,
      recipient_name || 'Recipient',
      student_name || null,
      text.trim(),
      channel
    ]);

    const createdMessage = result.rows[0];

    // Auto-create a notification for the recipient
    try {
      await query(`
        INSERT INTO notifications (user_id, title, message, notification_type, is_read, created_at)
        VALUES ($1, $2, $3, 'message', false, NOW())
      `, [
        recipient_id,
        `New Message from ${senderName}`,
        text.length > 80 ? text.substring(0, 80) + '...' : text
      ]);
    } catch (notifErr) {
      logger.warn(`Could not create notification for message: ${notifErr.message}`);
    }

    res.status(201).json({
      status: 'success',
      data: createdMessage
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
