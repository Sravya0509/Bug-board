const db = require('../config/db');

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_STATUSES = [
  'Yet to Start',
  'In Progress',
  'In Review',
  'Yet to Merge',
  'Completed',
  'Incompleted',
  'Query'
];

// Helper: resolve assignee_id and assignee_name
async function resolveAssignee(assignee_id, assignee_name) {
  if (assignee_id) {
    const [rows] = await db.execute('SELECT id, name FROM assignees WHERE id = ?', [assignee_id]);
    if (rows.length > 0) {
      return { id: rows[0].id, name: rows[0].name };
    }
  }

  if (assignee_name && assignee_name.trim()) {
    const cleanName = assignee_name.trim();
    const [existing] = await db.execute(
      'SELECT id, name FROM assignees WHERE LOWER(TRIM(name)) = LOWER(?)',
      [cleanName]
    );

    if (existing.length > 0) {
      return { id: existing[0].id, name: existing[0].name };
    }

    // Auto-create new assignee if not found
    const [result] = await db.execute('INSERT INTO assignees (name) VALUES (?)', [cleanName]);
    return { id: result.insertId, name: cleanName };
  }

  return { id: null, name: null };
}

// Get all issues with filtering, search, and sorting
async function getAllIssues(req, res) {
  try {
    const { search, status, priority, projectId, assignee, assigneeId } = req.query;

    let query = `
      SELECT
        i.id,
        i.title,
        i.description,
        i.project_id,
        p.name AS project_name,
        i.assignee_id,
        COALESCE(a.name, i.assignee_name) AS assignee_name,
        i.priority,
        i.status,
        i.created_by,
        creator.name AS created_by_name,
        i.created_at,
        i.updated_at
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN assignees a ON i.assignee_id = a.id
      LEFT JOIN users creator ON i.created_by = creator.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by project
    if (projectId) {
      query += ' AND i.project_id = ?';
      params.push(projectId);
    }

    // Filter by status
    if (status && VALID_STATUSES.includes(status)) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    // Filter by priority
    if (priority && VALID_PRIORITIES.includes(priority)) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }

    // Filter by assignee ID
    if (assigneeId) {
      query += ' AND i.assignee_id = ?';
      params.push(assigneeId);
    }

    // Filter by assignee name
    if (assignee && assignee.trim() !== '') {
      query += ' AND (LOWER(TRIM(a.name)) = LOWER(?) OR LOWER(TRIM(i.assignee_name)) = LOWER(?))';
      params.push(assignee.trim(), assignee.trim());
    }

    // Search by title, description, or assignee name
    if (search && search.trim() !== '') {
      query += ' AND (i.title LIKE ? OR i.description LIKE ? OR a.name LIKE ? OR i.assignee_name LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY i.updated_at DESC, i.created_at DESC';

    const [issues] = await db.execute(query, params);
    return res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({ message: 'Server error while fetching issues.' });
  }
}

// Get distinct assignees
async function getDistinctAssignees(req, res) {
  try {
    const [rows] = await db.execute('SELECT id, name FROM assignees ORDER BY name ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching distinct assignees:', error);
    return res.status(500).json({ message: 'Server error while fetching assignees.' });
  }
}

// Get single issue details by ID
async function getIssueById(req, res) {
  try {
    const issueId = req.params.id;

    const query = `
      SELECT
        i.id,
        i.title,
        i.description,
        i.project_id,
        p.name AS project_name,
        i.assignee_id,
        COALESCE(a.name, i.assignee_name) AS assignee_name,
        i.priority,
        i.status,
        i.created_by,
        creator.name AS created_by_name,
        i.created_at,
        i.updated_at
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN assignees a ON i.assignee_id = a.id
      LEFT JOIN users creator ON i.created_by = creator.id
      WHERE i.id = ?
    `;

    const [issues] = await db.execute(query, [issueId]);

    if (issues.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    return res.status(200).json(issues[0]);
  } catch (error) {
    console.error('Error fetching issue details:', error);
    return res.status(500).json({ message: 'Server error while fetching issue details.' });
  }
}

// Create a new issue
async function createIssue(req, res) {
  try {
    const { title, description, project_id, assignee_id, assignee_name, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Issue title is required.' });
    }

    if (!project_id) {
      return res.status(400).json({ message: 'Project selection is required.' });
    }

    // Verify project exists
    const [projects] = await db.execute('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) {
      return res.status(400).json({ message: 'Selected project does not exist.' });
    }

    const issuePriority = VALID_PRIORITIES.includes(priority) ? priority : 'Medium';
    const issueStatus = VALID_STATUSES.includes(status) ? status : 'Yet to Start';

    // Resolve assignee
    const { id: resolvedAssigneeId, name: resolvedAssigneeName } = await resolveAssignee(
      assignee_id,
      assignee_name
    );

    const [result] = await db.execute(
      `INSERT INTO issues (title, description, project_id, assignee_id, assignee_name, priority, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : '',
        project_id,
        resolvedAssigneeId,
        resolvedAssigneeName,
        issuePriority,
        issueStatus,
        req.user.id
      ]
    );

    return res.status(201).json({
      message: 'Issue created successfully.',
      issueId: result.insertId
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    return res.status(500).json({ message: 'Server error while creating issue.' });
  }
}

// Update an existing issue
async function updateIssue(req, res) {
  try {
    const issueId = req.params.id;
    const { title, description, project_id, assignee_id, assignee_name, priority, status } = req.body;

    const [existing] = await db.execute('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const currentIssue = existing[0];

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Issue title is required.' });
    }

    if (!project_id) {
      return res.status(400).json({ message: 'Project is required.' });
    }

    const newPriority = VALID_PRIORITIES.includes(priority) ? priority : currentIssue.priority;
    const newStatus = VALID_STATUSES.includes(status) ? status : currentIssue.status;

    // Resolve assignee updates
    let newAssigneeId = currentIssue.assignee_id;
    let newAssigneeName = currentIssue.assignee_name;

    if (assignee_id !== undefined || assignee_name !== undefined) {
      const resolved = await resolveAssignee(assignee_id, assignee_name);
      newAssigneeId = resolved.id;
      newAssigneeName = resolved.name;
    }

    await db.execute(
      `UPDATE issues
       SET title = ?, description = ?, project_id = ?, assignee_id = ?, assignee_name = ?, priority = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title.trim(),
        description ? description.trim() : '',
        project_id,
        newAssigneeId,
        newAssigneeName,
        newPriority,
        newStatus,
        issueId
      ]
    );

    return res.status(200).json({ message: 'Issue updated successfully.' });
  } catch (error) {
    console.error('Error updating issue:', error);
    return res.status(500).json({ message: 'Server error while updating issue.' });
  }
}

// Dedicated Reassign Endpoint
async function reassignIssue(req, res) {
  try {
    const issueId = req.params.id;
    const { assignee_id, assignee_name } = req.body;

    const [existing] = await db.execute('SELECT id FROM issues WHERE id = ?', [issueId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const resolved = await resolveAssignee(assignee_id, assignee_name);

    await db.execute(
      'UPDATE issues SET assignee_id = ?, assignee_name = ?, updated_at = NOW() WHERE id = ?',
      [resolved.id, resolved.name, issueId]
    );

    return res.status(200).json({
      message: 'Issue reassigned successfully.',
      assignee_id: resolved.id,
      assignee_name: resolved.name
    });
  } catch (error) {
    console.error('Error reassigning issue:', error);
    return res.status(500).json({ message: 'Server error while reassigning issue.' });
  }
}

// Quick status updater endpoint
async function updateIssueStatus(req, res) {
  try {
    const issueId = req.params.id;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const [existing] = await db.execute('SELECT id FROM issues WHERE id = ?', [issueId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    await db.execute(
      'UPDATE issues SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, issueId]
    );

    return res.status(200).json({ message: 'Issue status updated successfully.', status });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Server error while updating issue status.' });
  }
}

// Delete an issue
async function deleteIssue(req, res) {
  try {
    const issueId = req.params.id;

    const [result] = await db.execute('DELETE FROM issues WHERE id = ?', [issueId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    return res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return res.status(500).json({ message: 'Server error while deleting issue.' });
  }
}

// Get comments for an issue
async function getCommentsByIssue(req, res) {
  try {
    const issueId = req.params.id;

    const query = `
      SELECT
        c.id,
        c.issue_id,
        c.user_id,
        c.comment_text,
        c.created_at,
        u.name AS user_name,
        u.role AS user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `;

    const [comments] = await db.execute(query, [issueId]);
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: 'Server error while fetching comments.' });
  }
}

// Add a comment to an issue
async function addComment(req, res) {
  try {
    const issueId = req.params.id;
    const { comment_text } = req.body;

    if (!comment_text || comment_text.trim() === '') {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const [issues] = await db.execute('SELECT id FROM issues WHERE id = ?', [issueId]);
    if (issues.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const [result] = await db.execute(
      'INSERT INTO comments (issue_id, user_id, comment_text) VALUES (?, ?, ?)',
      [issueId, req.user.id, comment_text.trim()]
    );

    // Update issue's updated_at
    await db.execute('UPDATE issues SET updated_at = NOW() WHERE id = ?', [issueId]);

    return res.status(201).json({
      message: 'Comment added successfully.',
      commentId: result.insertId
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Server error while adding comment.' });
  }
}

module.exports = {
  getAllIssues,
  getDistinctAssignees,
  getIssueById,
  createIssue,
  updateIssue,
  reassignIssue,
  updateIssueStatus,
  deleteIssue,
  getCommentsByIssue,
  addComment
};
