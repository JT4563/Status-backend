function ok(res, data = {}) {
  res.json(data);
}
function created(res, data = {}) {
  res.status(201).json(data);
}
module.exports = { ok, created };
