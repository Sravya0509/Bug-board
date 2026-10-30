const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// All project routes require authentication
router.use(verifyToken);

// View projects (Admins and Developers)
router.get('/', projectsController.getAllProjects);
router.get('/:id', projectsController.getProjectById);

// Manage projects (Admin only)
router.post('/', requireAdmin, projectsController.createProject);
router.put('/:id', requireAdmin, projectsController.updateProject);
router.delete('/:id', requireAdmin, projectsController.deleteProject);

module.exports = router;
