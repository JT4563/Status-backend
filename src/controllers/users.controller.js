const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { success, error } = require('../utils/response');

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return error(res, 'MISSING_FIELDS', 'Name, email, password, and role are required', 400);
    }

    // Validate role
    if (!['admin', 'staff'].includes(role)) {
      return error(res, 'INVALID_ROLE', 'Role must be either admin or staff', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'USER_EXISTS', 'User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Set permissions based on role
    let permissions = [];
    if (role === 'admin') {
      permissions = [
        'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'AI_INSIGHTS', 
        'ADVANCED_ANALYTICS', 'CAMERA_MANAGEMENT', 'DATA_EXPORT',
        'VIEW_ALERTS', 'SUBMIT_ACTIONS', 'LOCATION_PINGS', 'BASIC_REPORTS'
      ];
    } else if (role === 'staff') {
      permissions = [
        'VIEW_ALERTS', 'ACKNOWLEDGE_ALERTS', 'SUBMIT_ACTIONS', 
        'LOCATION_PINGS', 'BASIC_REPORTS', 'VIEW_CAMERA_FEEDS'
      ];
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt
    };

    success(res, { user: userResponse }, `${role} user created successfully`);
  } catch (err) {
    console.error('Create user error:', err);
    error(res, 'CREATE_USER_FAILED', 'Failed to create user', 500);
  }
};

// List all users (Admin only)
const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const usersResponse = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    success(res, { users: usersResponse, count: users.length });
  } catch (err) {
    console.error('List users error:', err);
    error(res, 'LIST_USERS_FAILED', 'Failed to retrieve users', 500);
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    success(res, { user: userResponse });
  } catch (err) {
    console.error('Get user error:', err);
    error(res, 'GET_USER_FAILED', 'Failed to retrieve user', 500);
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // Prepare update data
    const updateData = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return error(res, 'EMAIL_EXISTS', 'Email already taken by another user', 409);
      }
      updateData.email = email;
    }

    if (role) {
      if (!['admin', 'staff'].includes(role)) {
        return error(res, 'INVALID_ROLE', 'Role must be either admin or staff', 400);
      }
      updateData.role = role;

      // Update permissions based on new role
      if (role === 'admin') {
        updateData.permissions = [
          'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'AI_INSIGHTS', 
          'ADVANCED_ANALYTICS', 'CAMERA_MANAGEMENT', 'DATA_EXPORT',
          'VIEW_ALERTS', 'SUBMIT_ACTIONS', 'LOCATION_PINGS', 'BASIC_REPORTS'
        ];
      } else if (role === 'staff') {
        updateData.permissions = [
          'VIEW_ALERTS', 'ACKNOWLEDGE_ALERTS', 'SUBMIT_ACTIONS', 
          'LOCATION_PINGS', 'BASIC_REPORTS', 'VIEW_CAMERA_FEEDS'
        ];
      }
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
      updateData.lastPasswordChange = new Date();
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-passwordHash');

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      lastActive: updatedUser.lastActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    success(res, { user: userResponse }, 'User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    error(res, 'UPDATE_USER_FAILED', 'Failed to update user', 500);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return error(res, 'CANNOT_DELETE_SELF', 'Cannot delete your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // Check if this is the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return error(res, 'LAST_ADMIN', 'Cannot delete the last admin user', 400);
      }
    }

    await User.findByIdAndDelete(id);
    
    success(res, { deletedUserId: id }, 'User deleted successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    error(res, 'DELETE_USER_FAILED', 'Failed to delete user', 500);
  }
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser
};
