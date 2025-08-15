const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'staff'], 
    required: true,
    default: 'staff'
  },
  permissions: [{
    type: String,
    enum: [
      // Admin permissions
      'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'AI_INSIGHTS', 
      'ADVANCED_ANALYTICS', 'CAMERA_MANAGEMENT', 'DATA_EXPORT',
      // Staff permissions  
      'VIEW_ALERTS', 'ACKNOWLEDGE_ALERTS', 'SUBMIT_ACTIONS', 
      'LOCATION_PINGS', 'BASIC_REPORTS', 'VIEW_CAMERA_FEEDS'
    ]
  }],
  lastActive: { type: Date },
  lastPasswordChange: { type: Date, default: Date.now },
  orgId: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Update lastActive when user is authenticated
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Check if user has specific permission
UserSchema.methods.hasPermission = function(permission) {
  // Admin has all permissions
  if (this.role === 'admin') return true;
  
  return this.permissions.includes(permission);
};

// Virtual for user's full permission set
UserSchema.virtual('allPermissions').get(function() {
  if (this.role === 'admin') {
    return [
      'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'AI_INSIGHTS', 
      'ADVANCED_ANALYTICS', 'CAMERA_MANAGEMENT', 'DATA_EXPORT',
      'VIEW_ALERTS', 'ACKNOWLEDGE_ALERTS', 'SUBMIT_ACTIONS', 
      'LOCATION_PINGS', 'BASIC_REPORTS', 'VIEW_CAMERA_FEEDS'
    ];
  }
  return this.permissions;
});

module.exports = mongoose.model('User', UserSchema);
