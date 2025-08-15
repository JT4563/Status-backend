const Report = require('../models/Report');
const { hashKey } = require('../utils/idempotency');

async function createReport(req, res, next) {
  try {
    const { eventId, zoneId, type, message, attachments } = req.body || {};
    if (!eventId || !message) return res.status(400).json({ error: { code: 'INVALID_PAYLOAD', message: 'eventId and message required' } });
    const idemKey = req.headers['idempotency-key'];
    const doc = {
      eventId, zoneId, type: type || 'other', message, attachments: attachments || [], createdAt: new Date()
    };
    if (idemKey) doc.idempotencyKey = hashKey(idemKey);
    let report;
    try {
      report = await Report.create(doc);
    } catch (e) {
      if (e.code === 11000) {
        // duplicate idempotency key → fetch existing
        report = await Report.findOne({ idempotencyKey: doc.idempotencyKey }).lean();
      } else throw e;
    }
    const payload = { id: report._id, status: 'received' };
    const ioApi = req.app.get('ioApi');
    ioApi.emitToEvent(String(report.eventId), 'report:new', { id: report._id, message: report.message, type: report.type, createdAt: report.createdAt });
    res.status(202).json(payload);
  } catch (e) { next(e); }
}

async function listReports(req, res, next) {
  try {
    const { eventId, status } = req.query;
    if (!eventId) return res.status(400).json({ error: { code: 'MISSING_EVENT', message: 'eventId required' } });
    const q = { eventId };
    if (status) q.status = status;
    const items = await Report.find(q).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
}

module.exports = { createReport, listReports };
