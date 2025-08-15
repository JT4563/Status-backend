function clampBBox(bbox) {
  // bbox: minLng,minLat,maxLng,maxLat
  const [minLng, minLat, maxLng, maxLat] = bbox.map(Number);
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
    throw Object.assign(new Error('Invalid bbox'), { status: 400, code: 'INVALID_BBOX' });
  }
  if (minLng >= maxLng || minLat >= maxLat) {
    throw Object.assign(new Error('Invalid bbox ranges'), { status: 400, code: 'INVALID_BBOX' });
  }
  return [minLng, minLat, maxLng, maxLat];
}

function toGridKey(lat, lng, cellDeg) {
  const latCell = Math.floor(lat / cellDeg) * cellDeg;
  const lngCell = Math.floor(lng / cellDeg) * cellDeg;
  return `${latCell.toFixed(6)},${lngCell.toFixed(6)}`;
}

module.exports = { clampBBox, toGridKey };
