const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  command: { type: String, required: true },
  notes: String,
  relatesToAlertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  deliveredVia: [{ type: String, enum: ['socket','sms','whatsapp'] }]
}, { timestamps: false });

module.exports = mongoose.model('Action', ActionSchema);
