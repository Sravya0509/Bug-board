const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// Route to fetch developers for assignment dropdown (authenticated users)
router.get('/developers', verifyToken, usersController.getDevelopers);

// Route to fetch all users (Admin only)
router.get('/', verifyToken, requireAdmin, usersController.getAllUsers);

module.exports = router;
