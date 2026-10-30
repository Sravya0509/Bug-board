const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Dashboard stats route (accessible to authenticated users)
router.get('/', verifyToken, dashboardController.getDashboardStats);

module.exports = router;
