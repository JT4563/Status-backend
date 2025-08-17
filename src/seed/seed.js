require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");
const Zone = require("../models/Zone");

(async () => {
  try {
    await connectDb();

    // Clear existing users
    await User.deleteMany({
      email: { $in: ["admin@crowdshield.ai", "staff@crowdshield.ai"] },
    });

    // Create admin user with full permissions
    const adminPasswordHash = await bcrypt.hash("admin123!", 10);
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@crowdshield.ai",
      passwordHash: adminPasswordHash,
      role: "admin",
      permissions: [
        "USER_MANAGEMENT",
        "SYSTEM_CONFIG",
        "AI_INSIGHTS",
        "ADVANCED_ANALYTICS",
        "CAMERA_MANAGEMENT",
        "DATA_EXPORT",
        "VIEW_ALERTS",
        "ACKNOWLEDGE_ALERTS",
        "SUBMIT_ACTIONS",
        "LOCATION_PINGS",
        "BASIC_REPORTS",
        "VIEW_CAMERA_FEEDS",
      ],
      isActive: true,
    });

    // Create staff user with limited permissions
    const staffPasswordHash = await bcrypt.hash("staff123!", 10);
    const staffUser = await User.create({
      name: "Field Operator",
      email: "staff@crowdshield.ai",
      passwordHash: staffPasswordHash,
      role: "staff",
      permissions: [
        "VIEW_ALERTS",
        "ACKNOWLEDGE_ALERTS",
        "SUBMIT_ACTIONS",
        "LOCATION_PINGS",
        "BASIC_REPORTS",
        "VIEW_CAMERA_FEEDS",
      ],
      isActive: true,
    });

    // Minimal event + square bounds
    const event = await Event.create({
      name: "Demo Event",
      venue: "Demo Grounds",
      startAt: new Date(Date.now() - 3600000),
      endAt: new Date(Date.now() + 6 * 3600000),
      bounds: {
        type: "Polygon",
        coordinates: [
          [
            [77.58, 12.96],
            [77.64, 12.96],
            [77.64, 13.02],
            [77.58, 13.02],
            [77.58, 12.96],
          ],
        ],
      },
      createdBy: adminUser._id,
    });

    const zone = await Zone.create({
      eventId: event._id,
      name: "Zone A",
      polygon: {
        type: "Polygon",
        coordinates: [
          [
            [77.59, 12.97],
            [77.61, 12.97],
            [77.61, 12.99],
            [77.59, 12.99],
            [77.59, 12.97],
          ],
        ],
      },
    });

    console.log("🚀 Seed complete - Enhanced Permission System!");
    console.log("");
    console.log("👑 ADMIN LOGIN:");
    console.log("   Email: admin@crowdshield.ai");
    console.log("   Password: admin123!");
    console.log("   Role: admin");
    console.log(
      "   Permissions: ALL (User Management, AI Insights, System Config, etc.)"
    );
    console.log("");
    console.log("👥 STAFF LOGIN:");
    console.log("   Email: staff@crowdshield.ai");
    console.log("   Password: staff123!");
    console.log("   Role: staff");
    console.log(
      "   Permissions: LIMITED (View Alerts, Submit Actions, Basic Reports)"
    );
    console.log("");
    console.log("🆔 IDs:");
    console.log("   Admin ID:", String(adminUser._id));
    console.log("   Staff ID:", String(staffUser._id));
    console.log("   EventId:", String(event._id));
    console.log("   ZoneId:", String(zone._id));
    console.log("");
    console.log(
      "🔐 PERMISSION SYSTEM ACTIVE - Admin and Staff now have different access levels!"
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
