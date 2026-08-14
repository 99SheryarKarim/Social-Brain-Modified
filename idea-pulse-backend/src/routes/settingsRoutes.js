const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const db = require('../../database/init');

router.get('/', authMiddleware, getSettings);
router.post('/', authMiddleware, saveSettings);

// Change display name
router.patch('/username', authMiddleware, (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
  db.run(`UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [username.trim(), req.user.id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(200).json({ message: 'Username updated', username: username.trim() });
    });
});

// Change password
router.patch('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords are required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

  db.get(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id], async (err, row) => {
    if (err || !row) return res.status(500).json({ message: 'User not found' });
    const match = await bcrypt.compare(currentPassword, row.password_hash);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [hashed, req.user.id], (err2) => {
        if (err2) return res.status(500).json({ message: err2.message });
        res.status(200).json({ message: 'Password changed successfully' });
      });
  });
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required to delete account' });

  db.get(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id], async (err, row) => {
    if (err || !row) return res.status(500).json({ message: 'User not found' });
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });
    db.run(`DELETE FROM users WHERE id = ?`, [req.user.id], (err2) => {
      if (err2) return res.status(500).json({ message: err2.message });
      res.status(200).json({ message: 'Account deleted successfully' });
    });
  });
});

module.exports = router;
