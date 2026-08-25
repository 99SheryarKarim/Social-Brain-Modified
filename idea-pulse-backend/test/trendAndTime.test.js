const test = require('node:test');
const assert = require('node:assert/strict');
const { getFallbackTrends, matchTrendToNiche } = require('../src/services/trendService');
const { rankHistoricalRows } = require('../src/utils/postTimeUtils');

test('matches the most relevant trend and breaks ties by popularity', () => {
  const result = matchTrendToNiche([
    { topic: 'Fashion week', niche: 'Fashion', popularity_score: 90 },
    { topic: 'AI fitness coach', niche: 'Fitness', popularity_score: 10 },
  ], 'Fitness');
  assert.equal(result.trend.topic, 'AI fitness coach');
  assert.equal(result.relevanceScore, 1);
});

test('returns niche-specific fallback trends', () => {
  const trends = getFallbackTrends('Fitness');
  assert.equal(trends.length, 5);
  assert.equal(trends[0].source, 'fallback');
  assert.equal(trends[0].niche, 'Fitness');
});

test('ranks historical time buckets by engagement and post count', () => {
  const result = rankHistoricalRows([
    { engagement: 20, post_count: 1 },
    { engagement: 20, post_count: 3 },
    { engagement: 10, post_count: 9 },
  ]);
  assert.equal(result[0].post_count, 3);
});
