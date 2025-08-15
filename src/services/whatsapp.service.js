async function sendWhatsApp(to, body) {
  // Integrate WhatsApp provider here; this is a stub
  console.log('WhatsApp stub →', to, body);
  return { ok: true };
}
module.exports = { sendWhatsApp };
