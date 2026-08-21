const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const startupRoutes = require('./startupRoutes');
const notificationRoutes = require('./notificationRoutes');
const researchRoutes = require('./researchRoutes');
const fundingRoutes = require('./fundingRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const searchRoutes = require('./searchRoutes');
const logRoutes = require('./logRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/', userRoutes); // /users, /approvals, /mentors, /investors
router.use('/startups', startupRoutes);
router.use('/notifications', notificationRoutes);
router.use('/research', researchRoutes);
router.use('/funding', fundingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);
router.use('/logs', logRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'EduNexus API is running', time: new Date().toISOString() });
});

module.exports = router;
