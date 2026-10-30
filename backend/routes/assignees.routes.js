const express = require('express');
const router = express.Router();
const assigneesController = require('../controllers/assignees.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All assignee routes require authentication
router.use(verifyToken);

router.get('/', assigneesController.getAllAssignees);
router.get('/:id', assigneesController.getAssigneeById);
router.post('/', assigneesController.createAssignee);
router.put('/:id', assigneesController.updateAssignee);
router.delete('/:id', assigneesController.deleteAssignee);

module.exports = router;
