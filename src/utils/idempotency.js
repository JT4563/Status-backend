const crypto = require('crypto');
function hashKey(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}
module.exports = { hashKey };
