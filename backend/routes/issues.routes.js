const express = require('express');
const router = express.Router();
const issuesController = require('../controllers/issues.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All issue routes require authentication
router.use(verifyToken);

// View issues and assignees
router.get('/', issuesController.getAllIssues);
router.get('/assignees', issuesController.getDistinctAssignees);
router.get('/:id', issuesController.getIssueById);

// Create issue
router.post('/', issuesController.createIssue);

// Update issue
router.put('/:id', issuesController.updateIssue);

// Dedicated reassign endpoint
router.patch('/:id/reassign', issuesController.reassignIssue);

// Quick status update endpoint
router.patch('/:id/status', issuesController.updateIssueStatus);

// Delete issue
router.delete('/:id', issuesController.deleteIssue);

// Issue comments
router.get('/:id/comments', issuesController.getCommentsByIssue);
router.post('/:id/comments', issuesController.addComment);

module.exports = router;
