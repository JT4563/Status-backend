const { getMapData } = require("../services/map.service");

async function getMap(req, res, next) {
  try {
    const { eventId, bbox, windowSec } = {
      eventId: req.query.eventId,
      bbox: (req.query.bbox || "").split(",").map(Number),
      windowSec: req.query.windowSec ? Number(req.query.windowSec) : undefined,
    };
    if (!eventId)
      return res
        .status(400)
        .json({
          error: { code: "MISSING_EVENT", message: "eventId required" },
        });
    if (!bbox || bbox.length !== 4 || bbox.some(isNaN))
      return res
        .status(400)
        .json({
          error: { code: "INVALID_BBOX", message: "bbox query required" },
        });
    const data = await getMapData({ eventId, bbox, windowSec });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { getMap };
