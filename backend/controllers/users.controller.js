const db = require('../config/db');

// Get all developers for assignment in issue forms
async function getDevelopers(req, res) {
  try {
    const [developers] = await db.execute(
      'SELECT id, name, email FROM users WHERE role = ? ORDER BY name ASC',
      ['Developer']
    );
    return res.status(200).json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    return res.status(500).json({ message: 'Server error while fetching developers.' });
  }
}

// Get all users (Admin only)
async function getAllUsers(req, res) {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error while fetching users.' });
  }
}

module.exports = {
  getDevelopers,
  getAllUsers
};
