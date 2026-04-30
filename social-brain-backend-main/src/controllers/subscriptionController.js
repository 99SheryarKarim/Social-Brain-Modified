const db = require('../../database/init');

const FREE_LIMIT = 10;

// Get user plan and usage
exports.getPlan = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.get(`SELECT plan, daily_usage, usage_reset_at FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });

    const now = new Date();
    const resetAt = new Date(row?.usage_reset_at || now);
    const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60);

    // Reset usage if 24 hours have passed
    if (hoursSinceReset >= 24) {
      db.run(`UPDATE users SET daily_usage = 0, usage_reset_at = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);
      return res.status(200).json({
        plan: row?.plan || 'free',
        daily_usage: 0,
        limit: FREE_LIMIT,
        remaining: FREE_LIMIT,
        reset_at: new Date().toISOString(),
      });
    }

    const usage = row?.daily_usage || 0;
    const plan = row?.plan || 'free';
    res.status(200).json({
      plan,
      daily_usage: usage,
      limit: plan === 'premium' ? null : FREE_LIMIT,
      remaining: plan === 'premium' ? null : Math.max(0, FREE_LIMIT - usage),
      reset_at: row?.usage_reset_at,
    });
  });
};

// Upgrade to premium — only via Stripe payment, this endpoint is disabled
exports.upgradePlan = (req, res) => {
  res.status(403).json({ message: 'Please use the payment flow to upgrade.' });
};

// Downgrade back to free (for testing)
exports.downgradePlan = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.run(`UPDATE users SET plan = 'free', daily_usage = 0 WHERE id = ?`, [userId], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: 'Downgraded to Free', plan: 'free' });
  });
};

// Middleware — check usage limit before AI generation
exports.checkUsageLimit = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return next(); // guest — let through, handled elsewhere

  const jwt = require('jsonwebtoken');
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded?.id;
  } catch { return next(); }

  if (!userId) return next();

  db.get(`SELECT plan, daily_usage, usage_reset_at FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err || !row) return next();

    const plan = row.plan || 'free';
    if (plan === 'premium') return next(); // premium — no limit

    const now = new Date();
    const resetAt = new Date(row.usage_reset_at || now);
    const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60);

    let usage = row.daily_usage || 0;

    // Reset if 24h passed
    if (hoursSinceReset >= 24) {
      db.run(`UPDATE users SET daily_usage = 0, usage_reset_at = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);
      usage = 0;
    }

    if (usage >= FREE_LIMIT) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message: `Free plan allows ${FREE_LIMIT} generations per 24 hours. Upgrade to Premium for unlimited access.`,
        limit: FREE_LIMIT,
        usage,
        upgrade: true,
      });
    }

    // Increment usage
    db.run(`UPDATE users SET daily_usage = daily_usage + 1 WHERE id = ?`, [userId]);
    next();
  });
};
