/**
 * Middleware to check if user has admin access (full access)
 * Allows: admin (from User model) or admin (from Admin model)
 */
module.exports = async (req, res, next) => {
  try {
    // Check if user is authenticated (from User model) and is admin
    if (req.user && req.user.role === "admin") {
      return next();
    }

    // Check if admin is authenticated (from Admin model) and is admin
    if (req.admin && req.admin.role === "admin") {
      return next();
    }

    return res.status(403).json({
      status: "fail",
      error: "You are not authorized to access this. Admin access required."
    });

  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: "Authorization check failed"
    });
  }
};

