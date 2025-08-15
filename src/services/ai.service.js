const axios = require('axios');
const AiInsight = require('../models/AiInsight');
const AiPrediction = require('../models/AiPrediction');

async function callML(path, payload) {
  const base = process.env.ML_BASE;
  if (!base) throw new Error('ML_BASE not configured');
  const url = `${base}${path.startsWith('/') ? path : '/'+path}`;
  try {
    const res = await axios.post(url, payload, { timeout: 1500 });
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function getInsights(eventId, features) {
  const result = await callML('/insights', { eventId, ...features });
  if (result.ok) {
    const doc = await AiInsight.create({ eventId, ...result.data, generatedAt: new Date() });
    return { ...doc.toObject(), mlStatus: 'ok' };
  } else {
    const last = await AiInsight.findOne({ eventId }).sort({ generatedAt: -1 }).lean();
    if (last) return { ...last, mlStatus: 'degraded' };
    return { riskScore: 0, recommendation: 'Insufficient data', confidence: 0, factors: [], mlStatus: 'down', generatedAt: new Date().toISOString() };
  }
}

async function getPredictions(eventId, horizonMinutes, features={}) {
  const result = await callML('/predictions', { eventId, horizonMinutes, features });
  if (result.ok) {
    const doc = await AiPrediction.create({ eventId, horizonMinutes, ...result.data, generatedAt: new Date() });
    return { ...doc.toObject(), mlStatus: 'ok' };
  } else {
    const last = await AiPrediction.findOne({ eventId, horizonMinutes }).sort({ generatedAt: -1 }).lean();
    if (last) return { ...last, mlStatus: 'degraded' };
    return { horizonMinutes, predictions: [], mlStatus: 'down', generatedAt: new Date().toISOString() };
  }
}

module.exports = { getInsights, getPredictions };
