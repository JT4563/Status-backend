const { getInsights, getPredictions } = require('../services/ai.service');

async function aiInsights(req, res, next) {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: { code: 'MISSING_EVENT', message: 'eventId required' } });
    const result = await getInsights(eventId, {});
    const ioApi = req.app.get('ioApi');
    ioApi.emitToEvent(eventId, 'insight:update', result);
    res.json(result);
  } catch (e) { next(e); }
}

async function aiPredictions(req, res, next) {
  try {
    const { eventId, horizonMinutes } = req.query;
    if (!eventId) return res.status(400).json({ error: { code: 'MISSING_EVENT', message: 'eventId required' } });
    const horizon = Number(horizonMinutes || 5);
    const result = await getPredictions(eventId, horizon, {});
    const ioApi = req.app.get('ioApi');
    ioApi.emitToEvent(eventId, 'prediction:update', result);
    res.json(result);
  } catch (e) { next(e); }
}

module.exports = { aiInsights, aiPredictions };
