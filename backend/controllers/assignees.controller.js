const db = require('../config/db');

// Get all assignees with assigned issue counts
async function getAllAssignees(req, res) {
  try {
    const query = `
      SELECT
        a.id,
        a.name,
        a.created_at,
        a.updated_at,
        COUNT(i.id) AS assigned_issues_count
      FROM assignees a
      LEFT JOIN issues i ON a.id = i.assignee_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `;
    const [assignees] = await db.execute(query);
    return res.status(200).json(assignees);
  } catch (error) {
    console.error('Error fetching assignees:', error);
    return res.status(500).json({ message: 'Server error while fetching assignees.' });
  }
}

// Get single assignee with their assigned issues
async function getAssigneeById(req, res) {
  try {
    const assigneeId = req.params.id;

    const [rows] = await db.execute('SELECT * FROM assignees WHERE id = ?', [assigneeId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Assignee not found.' });
    }

    const assignee = rows[0];

    const [issues] = await db.execute(
      `SELECT i.id, i.title, i.priority, i.status, i.created_at, i.updated_at, p.name AS project_name
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE i.assignee_id = ?
       ORDER BY i.updated_at DESC`,
      [assigneeId]
    );

    assignee.issues = issues;

    return res.status(200).json(assignee);
  } catch (error) {
    console.error('Error fetching assignee details:', error);
    return res.status(500).json({ message: 'Server error while fetching assignee details.' });
  }
}

// Create a new assignee
async function createAssignee(req, res) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Assignee name is required.' });
    }

    const cleanName = name.trim();

    // Check for duplicates (case-insensitive & trimmed)
    const [existing] = await db.execute(
      'SELECT id FROM assignees WHERE LOWER(TRIM(name)) = LOWER(?)',
      [cleanName]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'An assignee with this name already exists.' });
    }

    const [result] = await db.execute(
      'INSERT INTO assignees (name) VALUES (?)',
      [cleanName]
    );

    return res.status(201).json({
      message: 'Assignee created successfully.',
      assignee: {
        id: result.insertId,
        name: cleanName
      }
    });
  } catch (error) {
    console.error('Error creating assignee:', error);
    return res.status(500).json({ message: 'Server error while creating assignee.' });
  }
}

// Update an existing assignee's name
async function updateAssignee(req, res) {
  try {
    const assigneeId = req.params.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Assignee name is required.' });
    }

    const cleanName = name.trim();

    // Check assignee exists
    const [rows] = await db.execute('SELECT id, name FROM assignees WHERE id = ?', [assigneeId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Assignee not found.' });
    }

    // Check duplicate name for other assignees
    const [existing] = await db.execute(
      'SELECT id FROM assignees WHERE LOWER(TRIM(name)) = LOWER(?) AND id != ?',
      [cleanName, assigneeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Another assignee with this name already exists.' });
    }

    // Update in assignees table
    await db.execute(
      'UPDATE assignees SET name = ?, updated_at = NOW() WHERE id = ?',
      [cleanName, assigneeId]
    );

    // Keep issues.assignee_name synchronized
    await db.execute(
      'UPDATE issues SET assignee_name = ?, updated_at = NOW() WHERE assignee_id = ?',
      [cleanName, assigneeId]
    );

    return res.status(200).json({
      message: 'Assignee updated successfully.',
      assignee: {
        id: Number(assigneeId),
        name: cleanName
      }
    });
  } catch (error) {
    console.error('Error updating assignee:', error);
    return res.status(500).json({ message: 'Server error while updating assignee.' });
  }
}

// Delete an assignee (Prevent deletion if issues are assigned to them)
async function deleteAssignee(req, res) {
  try {
    const assigneeId = req.params.id;

    // Check assignee exists
    const [rows] = await db.execute('SELECT id, name FROM assignees WHERE id = ?', [assigneeId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Assignee not found.' });
    }

    const assignee = rows[0];

    // Check if issues are assigned to this person
    const [issueCountRows] = await db.execute(
      'SELECT COUNT(*) AS count FROM issues WHERE assignee_id = ?',
      [assigneeId]
    );

    const assignedCount = issueCountRows[0].count;

    if (assignedCount > 0) {
      return res.status(400).json({
        message: `Cannot delete "${assignee.name}". There are ${assignedCount} issue(s) currently assigned to this person. Please reassign those issues before deleting.`
      });
    }

    await db.execute('DELETE FROM assignees WHERE id = ?', [assigneeId]);

    return res.status(200).json({ message: `Assignee "${assignee.name}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting assignee:', error);
    return res.status(500).json({ message: 'Server error while deleting assignee.' });
  }
}

module.exports = {
  getAllAssignees,
  getAssigneeById,
  createAssignee,
  updateAssignee,
  deleteAssignee
};
