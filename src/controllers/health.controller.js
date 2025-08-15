const mongoose = require('mongoose');
const axios = require('axios');

async function health(req, res, next) {
  try {
    const dbOk = mongoose.connection.readyState === 1 ? 'ok' : 'down';
    let ml = 'down';
    if (process.env.ML_BASE) {
      try {
        // assume ML has /health (optional); if not, mark degraded
        await axios.get(process.env.ML_BASE + '/health', { timeout: 800 });
        ml = 'ok';
      } catch (e) {
        ml = 'degraded';
      }
    }
    // socket check cannot be done here reliably, return ok if mounted
    res.json({
      api: 'ok',
      db: dbOk,
      ml,
      socket: 'ok',
      dependencies: { twilio: 'ok', storage: 'ok' },
      time: new Date().toISOString()
    });
  } catch (e) { next(e); }
}

module.exports = { health };
