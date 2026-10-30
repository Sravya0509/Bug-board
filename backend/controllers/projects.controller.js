const db = require('../config/db');

// Get all projects with issue count
async function getAllProjects(req, res) {
  try {
    const query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.updated_at,
        p.created_by,
        u.name AS creator_name,
        COUNT(i.id) AS total_issues
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN issues i ON p.id = i.project_id
      GROUP BY p.id
      ORDER BY p.updated_at DESC, p.created_at DESC
    `;
    const [projects] = await db.execute(query);
    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Server error while fetching projects.' });
  }
}

// Get single project details by ID with its issues
async function getProjectById(req, res) {
  try {
    const projectId = req.params.id;

    const [projects] = await db.execute(
      `SELECT p.id, p.name, p.description, p.created_at, p.updated_at, p.created_by, u.name AS creator_name
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = projects[0];

    // Fetch issues for this project
    const [issues] = await db.execute(
      `SELECT
         i.id,
         i.title,
         i.assignee_name,
         i.priority,
         i.status,
         i.created_at,
         i.updated_at,
         creator.name AS created_by_name
       FROM issues i
       LEFT JOIN users creator ON i.created_by = creator.id
       WHERE i.project_id = ?
       ORDER BY i.updated_at DESC, i.created_at DESC`,
      [projectId]
    );

    project.issues = issues;

    return res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    return res.status(500).json({ message: 'Server error while fetching project details.' });
  }
}

// Create a new project
async function createProject(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const [result] = await db.execute(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name.trim(), description ? description.trim() : '', req.user.id]
    );

    return res.status(201).json({
      message: 'Project created successfully.',
      projectId: result.insertId
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Server error while creating project.' });
  }
}

// Update an existing project
async function updateProject(req, res) {
  try {
    const projectId = req.params.id;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const [result] = await db.execute(
      'UPDATE projects SET name = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), description ? description.trim() : '', projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({ message: 'Project updated successfully.' });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Server error while updating project.' });
  }
}

// Delete a project
async function deleteProject(req, res) {
  try {
    const projectId = req.params.id;

    const [result] = await db.execute(
      'DELETE FROM projects WHERE id = ?',
      [projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Server error while deleting project.' });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
