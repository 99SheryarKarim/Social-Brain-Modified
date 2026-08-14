const db = require('../../database/init');

// Save a new activity entry
exports.saveActivity = (req, res) => {
  const { type, description, meta } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!type || !description) return res.status(400).json({ message: 'type and description required' });

  db.run(
    `INSERT INTO activity (user_id, type, description, meta) VALUES (?, ?, ?, ?)`,
    [userId, type, description, meta ? JSON.stringify(meta) : null],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

// Get all activity for logged in user
exports.getActivity = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.all(
    `SELECT * FROM activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(200).json(rows.map(r => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null })));
    }
  );
};
