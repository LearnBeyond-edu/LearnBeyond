const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const institutionRoutes = require('./institutionRoutes');
const classRoutes = require('./classRoutes');
const lessonRoutes = require('./lessonRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/classes', classRoutes);
router.use('/lessons', lessonRoutes);

const assignmentRoutes = require('./assignmentRoutes');
const submissionRoutes = require('./submissionRoutes');
const quizRoutes = require('./quizRoutes');
const progressRoutes = require('./progressRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const settingRoutes = require('./settingRoutes');
const lauraMemoryRoutes = require('./lauraMemoryRoutes');
const studentRoutes = require('./studentRoutes');
const staffRoutes = require('./staffRoutes');
const parentRoutes = require('./parentRoutes');
const therapistRoutes = require('./therapistRoutes');

// We will add more routes here as we implement other domains like
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/quizzes', quizRoutes);
router.use('/progress', progressRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/settings', settingRoutes);
router.use('/laura_memory', lauraMemoryRoutes);
router.use('/student_profiles', studentRoutes);
router.use('/staff_profiles', staffRoutes);
router.use('/parent_profiles', parentRoutes);
router.use('/therapist_profiles', therapistRoutes);
 
// assignments, submissions, quizzes, progress, attendance, etc.

module.exports = router;
