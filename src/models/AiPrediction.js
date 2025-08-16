const mongoose = require("mongoose");

const AiPredictionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    horizonMinutes: Number,
    predictions: [{ zoneId: String, risk: Number, confidence: Number }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("AiPrediction", AiPredictionSchema);
