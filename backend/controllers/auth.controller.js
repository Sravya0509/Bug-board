const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register handler - single administrator policy
async function register(req, res) {
  try {
    // Check if an administrator account already exists
    const [existingUsers] = await db.execute('SELECT COUNT(*) AS count FROM users');
    const userCount = existingUsers[0].count;

    if (userCount >= 1) {
      return res.status(403).json({
        message: 'Registration is disabled. The system is configured with a single administrator account. Team members use the administrator credentials to access BugBoard.'
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert sole administrator
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "Admin")',
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'Admin'
    };

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Administrator registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error while registering administrator.' });
  }
}

// Log in existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await db.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
}

// Get current user profile
async function getCurrentUser(req, res) {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error while fetching user profile.' });
  }
}

// Check system status: whether an administrator account is already set up
async function getAuthStatus(req, res) {
  try {
    const [users] = await db.execute('SELECT COUNT(*) AS count FROM users');
    return res.status(200).json({
      hasAdmin: users[0].count > 0,
      adminCount: users[0].count
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return res.status(500).json({ message: 'Server error while checking auth status.' });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  getAuthStatus
};
