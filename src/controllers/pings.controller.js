const LocationPing = require("../models/LocationPing");

async function createPing(req, res, next) {
  try {
    const { eventId, lat, lng, speed, heading, accuracy, ts } = req.body || {};
    if (!eventId || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({
        error: {
          code: "INVALID_PAYLOAD",
          message: "eventId, lat, lng required",
        },
      });
    }
    const doc = await LocationPing.create({
      eventId,
      source: "device",
      loc: { type: "Point", coordinates: [lng, lat] },
      speed,
      heading,
      accuracy,
      createdAt: ts ? new Date(ts) : new Date(),
    });
    const ioApi = req.app.get("ioApi");
    ioApi.emitToEvent(eventId, "map:update", {
      points: [{ lat, lng, ts: doc.createdAt.toISOString() }],
      density: [],
      updatedAt: new Date().toISOString(),
      source: "live",
    });
    res.status(201).json({ id: doc._id });
  } catch (e) {
    next(e);
  }
}

module.exports = { createPing };
