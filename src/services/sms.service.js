async function sendSms(to, body) {
  // Integrate Twilio here; this is a stub
  console.log('SMS stub →', to, body);
  return { ok: true };
}
module.exports = { sendSms };
