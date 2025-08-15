const Alert = require('../models/Alert');

async function listAlerts(req, res, next) {
  try {
    const { eventId, status } = req.query;
    if (!eventId) return res.status(400).json({ error: { code: 'MISSING_EVENT', message: 'eventId required' } });
    const q = { eventId };
    if (status) q.status = status;
    const items = await Alert.find(q).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
}

async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await Alert.findByIdAndUpdate(id, { status: 'resolved', resolvedAt: new Date() }, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    const ioApi = req.app.get('ioApi');
    ioApi.emitToEvent(String(updated.eventId), 'alert:updated', { id: updated._id, status: updated.status, resolvedAt: updated.resolvedAt });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { listAlerts, resolveAlert };
