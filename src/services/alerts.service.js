const Alert = require('../models/Alert');

async function createAlert(data) {
  const alert = await Alert.create(data);
  return alert.toObject();
}

module.exports = { createAlert };
