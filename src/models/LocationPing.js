const mongoose = require("mongoose");

const LocationPingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  source: {
    type: String,
    enum: ["device", "cctv", "aggregate"],
    default: "device",
  },
  loc: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  speed: Number,
  heading: Number,
  accuracy: Number,
  createdAt: { type: Date, default: Date.now, index: true },
});

// TTL 15 minutes
LocationPingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });
LocationPingSchema.index({ loc: "2dsphere" });

module.exports = mongoose.model("LocationPing", LocationPingSchema);
