const LocationPing = require('../models/LocationPing');
const { clampBBox, toGridKey } = require('../utils/geo');

async function getMapData({ eventId, bbox, windowSec }) {
  const [minLng, minLat, maxLng, maxLat] = clampBBox(bbox);
  const since = new Date(Date.now() - (windowSec || Number(process.env.WINDOW_SEC_DEFAULT || 300)) * 1000);
  const query = {
    eventId,
    createdAt: { $gte: since },
    loc: { $geoWithin: { $box: [[minLng, minLat], [maxLng, maxLat]] } }
  };
  const cellDeg = parseFloat(process.env.DENSITY_CELL_DEG || '0.001');
  const projection = { _id: 0, 'loc.coordinates': 1, createdAt: 1 };
  const pings = await LocationPing.find(query, projection).lean();
  const points = pings.map(p => ({ lat: p.loc.coordinates[1], lng: p.loc.coordinates[0], ts: p.createdAt.toISOString() }));

  const densityMap = new Map();
  for (const p of points) {
    const key = toGridKey(p.lat, p.lng, cellDeg);
    densityMap.set(key, (densityMap.get(key) || 0) + 1);
  }
  const density = Array.from(densityMap.entries()).map(([k, count]) => ({ cell: k.split(',').map(Number), count }));
  return { points, density, updatedAt: new Date().toISOString() };
}

module.exports = { getMapData };
