const axios = require('axios');

const FALLBACK_TRENDS = {
  technology: ['Artificial intelligence', 'Cybersecurity', 'Cloud computing', 'Developer tools', 'Digital privacy'],
  fashion: ['Sustainable fashion', 'Streetwear', 'Quiet luxury', 'Vintage styling', 'Fashion week'],
  fitness: ['Strength training', 'Zone 2 cardio', 'Wearable fitness', 'High-protein recipes', 'Mobility training'],
  default: ['Artificial intelligence', 'Sustainable living', 'Creator economy', 'Personal wellness', 'Small business growth'],
};

const normalise = (value) => String(value || '').trim().toLowerCase();

function getFallbackTrends(niche) {
  const key = normalise(niche);
  const values = FALLBACK_TRENDS[key] || FALLBACK_TRENDS.default;
  return values.map((topic, index) => ({
    topic,
    niche: niche || 'General',
    source: 'fallback',
    popularity_score: 100 - index * 10,
  }));
}

async function fetchGoogleTrends() {
  const response = await axios.get('https://trends.google.com/trends/api/dailytrends', {
    params: { hl: 'en-US', tz: 0, geo: 'US' },
    timeout: 5000,
  });
  const payload = JSON.parse(String(response.data).replace(/^\)\]\}',?\s*/, ''));
  return (payload.default?.trendingSearchesDays || []).flatMap((day) =>
    (day.trendingSearches || []).map((item, index) => ({
      topic: item.title?.query,
      popularity_score: Number(item.formattedTraffic?.replace(/[^0-9]/g, '')) || 100 - index,
      source: 'google-trends',
    }))
  ).filter((trend) => trend.topic);
}

function saveTrends(trends, niche) {
  const db = require('../../database/init');
  return Promise.all(trends.map((trend) => new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO trends (topic, niche, source, popularity_score, fetched_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [trend.topic, niche || 'General', trend.source, trend.popularity_score],
      (error) => (error ? reject(error) : resolve())
    );
  })));
}

async function fetchTrends(niche, { source = fetchGoogleTrends } = {}) {
  let trends;
  try {
    const fetched = await source(niche);
    const nicheWords = normalise(niche).split(/\s+/).filter(Boolean);
    const relevant = fetched.filter((trend) => {
      const text = normalise(trend.topic);
      return !nicheWords.length || nicheWords.some((word) => text.includes(word));
    });
    trends = (relevant.length ? relevant : fetched).slice(0, 5).map((trend, index) => ({
      ...trend,
      niche: niche || 'General',
      popularity_score: trend.popularity_score || 100 - index,
    }));
  } catch (error) {
    console.warn('Trend source failed, using fallback trends:', error.message);
    trends = getFallbackTrends(niche);
  }

  try { await saveTrends(trends, niche); } catch (error) { console.warn('Unable to persist trends:', error.message); }
  return trends;
}

function matchTrendToNiche(trends, userNiche) {
  const nicheWords = normalise(userNiche).split(/\W+/).filter((word) => word.length > 2);
  const ranked = (trends || []).map((trend) => {
    const trendWords = normalise(trend.topic).split(/\W+/).filter(Boolean);
    const matches = trendWords.filter((word) => nicheWords.includes(word));
    const relevanceScore = Math.min(1, (matches.length / Math.max(1, nicheWords.length)) + (trend.niche && normalise(trend.niche) === normalise(userNiche) ? 0.35 : 0));
    return { trend, relevanceScore: Number(relevanceScore.toFixed(2)), reason: matches.length ? `Matches your niche through: ${matches.join(', ')}.` : `A timely topic that can be adapted for ${userNiche || 'your audience'}.` };
  }).sort((left, right) => right.relevanceScore - left.relevanceScore || (right.trend.popularity_score || 0) - (left.trend.popularity_score || 0));
  return ranked[0] || null;
}

module.exports = { fetchTrends, matchTrendToNiche, getFallbackTrends, fetchGoogleTrends };