function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        error: { 
          code: 'INSUFFICIENT_PERMISSIONS', 
          message: `Access denied. Required roles: ${roles.join(', ')}`,
          userRole: userRole || 'anonymous',
          requiredRoles: roles
        } 
      });
    }
    next();
  };
}

// New admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: { 
        code: 'ADMIN_ONLY', 
        message: 'Administrator access required',
        userRole: req.user?.role || 'anonymous'
      } 
    });
  }
  next();
}

// Enhanced permission checking middleware
function requirePermission(permission) {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const userRole = req.user?.role;
    
    // Admin has all permissions by default
    if (userRole === 'admin') {
      return next();
    }
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: { 
          code: 'MISSING_PERMISSION', 
          message: `Permission required: ${permission}`,
          userRole: userRole || 'anonymous',
          requiredPermission: permission
        } 
      });
    }
    next();
  };
}

module.exports = { requireRole, requireAdmin, requirePermission };
