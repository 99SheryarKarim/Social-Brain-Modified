require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./services/schedulerService');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  startScheduler();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 To kill it on Windows, run: npx kill-port ${PORT}`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

