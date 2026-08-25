const { fetchTrends, matchTrendToNiche } = require('../services/trendService');
const { getRecommendedTime } = require('../services/postTimeRecommender');
const { logActivity } = require('../utils/activityLogger');

exports.getTrends = async (req, res) => {
  try {
    const niche = req.query.niche || 'General';
    const trends = await fetchTrends(niche);
    const match = matchTrendToNiche(trends, niche);
    if (req.user?.id) await logActivity(req.user.id, 'trends_fetched', `Fetched trends for ${niche}`, { niche, source: trends[0]?.source });
    res.json({ trends, matchedTrend: match });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getRecommendedTime = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    if (String(userId) !== String(req.user.id)) return res.status(403).json({ message: 'Cannot access another user\'s recommendation' });
    const platform = req.query.platform || 'facebook';
    const recommendation = await getRecommendedTime(userId, platform);
    await logActivity(req.user.id, 'recommended_time_viewed', `Viewed ${platform} posting recommendation`, { platform, basis: recommendation.basis });
    res.json(recommendation);
  } catch (error) { res.status(500).json({ message: error.message }); }
};