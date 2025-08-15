const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,
  venue: String,
  startAt: Date,
  endAt: Date,
  bounds: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: false }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orgId: String
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
