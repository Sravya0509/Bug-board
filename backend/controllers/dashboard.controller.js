const db = require('../config/db');

// Get comprehensive dashboard statistics grouped by status, priority, and recent updates
async function getDashboardStats(req, res) {
  try {
    // 1. Total counts for projects and issues
    const [projectCount] = await db.execute('SELECT COUNT(*) AS total_projects FROM projects');
    const [issueCount] = await db.execute('SELECT COUNT(*) AS total_issues FROM issues');

    // 2. Issues grouped by Status
    const [statusRows] = await db.execute(`
      SELECT status, COUNT(*) AS count
      FROM issues
      GROUP BY status
    `);

    const statusCounts = {
      'Yet to Start': 0,
      'In Progress': 0,
      'In Review': 0,
      'Yet to Merge': 0,
      'Completed': 0,
      'Incompleted': 0,
      'Query': 0
    };

    statusRows.forEach((row) => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = Number(row.count);
      }
    });

    // 3. Issues grouped by Priority
    const [priorityRows] = await db.execute(`
      SELECT priority, COUNT(*) AS count
      FROM issues
      GROUP BY priority
    `);

    const priorityCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    priorityRows.forEach((row) => {
      if (priorityCounts.hasOwnProperty(row.priority)) {
        priorityCounts[row.priority] = Number(row.count);
      }
    });

    // 4. Recently updated issues (latest 5 ordered by updated_at / created_at)
    const [recentIssues] = await db.execute(`
      SELECT
        i.id,
        i.title,
        i.assignee_name,
        i.priority,
        i.status,
        i.created_at,
        i.updated_at,
        p.name AS project_name
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      ORDER BY i.updated_at DESC, i.created_at DESC
      LIMIT 5
    `);

    const stats = {
      total_projects: Number(projectCount[0].total_projects || 0),
      total_issues: Number(issueCount[0].total_issues || 0),
      status_counts: statusCounts,
      priority_counts: priorityCounts,
      recent_issues: recentIssues
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
  }
}

module.exports = {
  getDashboardStats
};
