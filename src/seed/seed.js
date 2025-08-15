require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Zone = require('../models/Zone');

(async () => {
  try {
    await connectDb();
    await User.deleteMany({ email: 'admin@crowdshield.ai' });
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({ name: 'Admin', email: 'admin@crowdshield.ai', passwordHash, role: 'admin' });

    // Minimal event + square bounds
    const event = await Event.create({
      name: 'Demo Event',
      venue: 'Demo Grounds',
      startAt: new Date(Date.now() - 3600000),
      endAt: new Date(Date.now() + 6*3600000),
      bounds: { type: 'Polygon', coordinates: [[[77.58,12.96],[77.64,12.96],[77.64,13.02],[77.58,13.02],[77.58,12.96]]] },
      createdBy: user._id
    });

    const zone = await Zone.create({
      eventId: event._id,
      name: 'Zone A',
      polygon: { type: 'Polygon', coordinates: [[[77.59,12.97],[77.61,12.97],[77.61,12.99],[77.59,12.99],[77.59,12.97]]] }
    });

    console.log('Seed complete.');
    console.log('Login → email: admin@crowdshield.ai | password: password123');
    console.log('EventId:', String(event._id), 'ZoneId:', String(zone._id));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
