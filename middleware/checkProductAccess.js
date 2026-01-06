/**
 * Middleware to check if user has permission to add/edit/delete products
 * Allows: seller, admin (from User model) or seller, admin (from Admin model)
 */
module.exports = async (req, res, next) => {
  try {
    // Check if user is authenticated (from User model)
    if (req.user) {
      const userRole = req.user.role?.toLowerCase();
      if (userRole === "seller" || userRole === "admin") {
        return next();
      }
    }

    // Check if admin is authenticated (from Admin model)
    if (req.admin) {
      const adminRole = req.admin.role?.toLowerCase();
      if (adminRole === "seller" || adminRole === "admin") {
        return next();
      }
    }

    // Debug logging
    console.log("Product access check failed:", {
      hasUser: !!req.user,
      hasAdmin: !!req.admin,
      userRole: req.user?.role,
      adminRole: req.admin?.role,
    });

    return res.status(403).json({
      status: "fail",
      error:
        "You are not authorized to perform this action. Only sellers and admins can manage products.",
    });
  } catch (error) {
    console.error("Authorization check error:", error);
    res.status(500).json({
      status: "fail",
      error: "Authorization check failed",
    });
  }
};
