const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  type: { type: String, enum: ['hazard','medical','security','other'], default: 'other' },
  message: String,
  attachments: [String],
  status: { type: String, enum: ['open','triaged','closed'], default: 'open' },
  idempotencyKey: { type: String, index: true, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('Report', ReportSchema);
