const mongoose = require("mongoose");

const CameraSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
  cameraId: { type: String, index: true },
  label: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Camera", CameraSchema);
