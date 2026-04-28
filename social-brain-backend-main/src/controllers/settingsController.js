const db = require('../../database/init');

// Get settings for logged-in user
exports.getSettings = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.get(`SELECT * FROM settings WHERE user_id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(row || { brand_description: '', target_audience: '' });
  });
};

// Save/update settings for logged-in user
exports.saveSettings = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { brand_description = '', target_audience = '' } = req.body;

  db.run(
    `INSERT INTO settings (user_id, brand_description, target_audience, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id) DO UPDATE SET
       brand_description = excluded.brand_description,
       target_audience = excluded.target_audience,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, brand_description, target_audience],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(200).json({ message: 'Settings saved', brand_description, target_audience });
    }
  );
};
