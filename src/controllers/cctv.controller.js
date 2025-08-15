const Alert = require('../models/Alert');

async function ingestObjects(req, res, next) {
  try {
    const { eventId, cameraId, ts, objects } = req.body || {};
    if (!eventId || !cameraId || !Array.isArray(objects)) {
      return res.status(400).json({ error: { code: 'INVALID_PAYLOAD', message: 'eventId, cameraId, objects required' } });
    }
    // Simple heuristic demo: if objects length above threshold, raise overcrowd alert
    if (objects.length >= 30) {
      const alert = await Alert.create({
        eventId,
        type: 'overcrowd',
        message: `High crowd density detected by ${cameraId}`,
        severity: objects.length > 60 ? 'high' : 'med',
        status: 'active',
        source: 'rule'
      });
      // emit socket event
      const ioApi = req.app.get('ioApi');
      ioApi.emitToEvent(eventId, 'alert:new', {
        id: alert._id, type: alert.type, message: alert.message, severity: alert.severity, createdAt: alert.createdAt
      });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { ingestObjects };
