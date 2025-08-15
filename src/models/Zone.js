const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  name: String,
  polygon: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: true }
  }
}, { timestamps: true });

ZoneSchema.index({ polygon: '2dsphere' });

module.exports = mongoose.model('Zone', ZoneSchema);
