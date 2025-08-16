const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    type: {
      type: String,
      enum: ["overcrowd", "surge", "panic", "gate_block"],
      required: true,
    },
    message: String,
    severity: {
      type: String,
      enum: ["low", "med", "high", "critical"],
      default: "med",
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
    source: { type: String, enum: ["rule", "ml", "manual"], default: "rule" },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Alert", AlertSchema);
