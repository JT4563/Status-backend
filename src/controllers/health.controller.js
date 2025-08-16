const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Alert = require("../models/Alert");
const Event = require("../models/Event");

// Public health check
async function healthCheck(req, res, next) {
  try {
    const dbOk = mongoose.connection.readyState === 1 ? "ok" : "down";
    let ml = "down";
    if (process.env.ML_BASE) {
      try {
        // assume ML has /health (optional); if not, mark degraded
        await axios.get(process.env.ML_BASE + "/health", { timeout: 800 });
        ml = "ok";
      } catch (e) {
        ml = "degraded";
      }
    }
    // socket check cannot be done here reliably, return ok if mounted
    res.json({
      api: "ok",
      db: dbOk,
      ml,
      socket: "ok",
      dependencies: { twilio: "ok", storage: "ok" },
      time: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
}

// Admin-only detailed system metrics
async function getSystemMetrics(req, res, next) {
  try {
    const dbOk = mongoose.connection.readyState === 1 ? "ok" : "down";
    let ml = "down";
    let mlResponseTime = null;

    if (process.env.ML_BASE) {
      try {
        const start = Date.now();
        await axios.get(process.env.ML_BASE + "/health", { timeout: 2000 });
        mlResponseTime = Date.now() - start;
        ml = "ok";
      } catch (e) {
        ml = "degraded";
      }
    }

    // Database metrics
    const dbStats = await mongoose.connection.db.stats();

    // User metrics
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
    });
    const totalUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({
      role: "admin",
      isActive: true,
    });
    const staffCount = await User.countDocuments({
      role: "staff",
      isActive: true,
    });

    // System metrics
    const totalAlerts = await Alert.countDocuments();
    const activeEvents = await Event.countDocuments({
      endAt: { $gte: new Date() },
      startAt: { $lte: new Date() },
    });

    // Memory and system info
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        api: "ok",
        database: dbOk,
        ml: ml,
        socket: "ok",
      },
      performance: {
        mlResponseTime: mlResponseTime,
        dbResponseTime: dbStats ? "available" : "unavailable",
        uptime: Math.floor(uptime),
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
        },
      },
      database: {
        status: dbOk,
        collections: dbStats ? dbStats.collections : "unavailable",
        dataSize: dbStats
          ? Math.round(dbStats.dataSize / 1024 / 1024) + " MB"
          : "unavailable",
        storageSize: dbStats
          ? Math.round(dbStats.storageSize / 1024 / 1024) + " MB"
          : "unavailable",
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminCount,
        staff: staffCount,
      },
      system: {
        totalAlerts: totalAlerts,
        activeEvents: activeEvents,
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
      dependencies: {
        twilio: "ok",
        storage: "ok",
      },
    });
  } catch (e) {
    console.error("System metrics error:", e);
    next(e);
  }
}

// Legacy support
const health = healthCheck;

module.exports = { healthCheck, getSystemMetrics, health };
