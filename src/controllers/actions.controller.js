const Action = require('../models/Action');
const { sendSms } = require('../services/sms.service');
const { sendWhatsApp } = require('../services/whatsapp.service');

async function createAction(req, res, next) {
  try {
    const { eventId, zoneId, command, notes, relatesToAlertId } = req.body || {};
    if (!eventId || !command) return res.status(400).json({ error: { code: 'INVALID_PAYLOAD', message: 'eventId and command required' } });
    const action = await Action.create({
      eventId, zoneId, command, notes, relatesToAlertId,
      createdBy: req.user?.id, createdAt: new Date(), deliveredVia: ['socket']
    });
    // trigger stubs
    if (/sms|broadcast/i.test(command)) await sendSms('recipient', command);
    if (/whatsapp/i.test(command)) await sendWhatsApp('recipient', command);

    const payload = {
      id: action._id, eventId, zoneId, command, notes, createdBy: action.createdBy, createdAt: action.createdAt, deliveredVia: action.deliveredVia
    };
    const ioApi = req.app.get('ioApi');
    ioApi.emitToEvent(eventId, 'action:created', payload);
    res.status(201).json(payload);
  } catch (e) { next(e); }
}

module.exports = { createAction };
