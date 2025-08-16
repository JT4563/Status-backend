const mongoose = require("mongoose");

const AiInsightSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    riskScore: Number,
    recommendation: String,
    confidence: Number,
    factors: [{ name: String, weight: Number }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("AiInsight", AiInsightSchema);
