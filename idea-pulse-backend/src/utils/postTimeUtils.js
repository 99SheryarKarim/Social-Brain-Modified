function rankHistoricalRows(rows) {
  return [...(rows || [])].sort((left, right) => right.engagement - left.engagement || right.post_count - left.post_count);
}

module.exports = { rankHistoricalRows };