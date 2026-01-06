const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { secret } = require("../config/secret");
const User = require("../model/User");

/**
 * Verify token and attach user info to request
 * Works with User tokens for all roles (buyer, seller, admin)
 */
module.exports = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];

    if (!token) {
      return res.status(401).json({
        status: "fail",
        error: "You are not logged in",
      });
    }

    const decoded = await promisify(jwt.verify)(token, secret.token_secret);

    // Get ID from token (could be _id or id)
    const userId = decoded._id || decoded.id;

    if (!userId) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid token format",
      });
    }

    // Find user in User collection
    const user = await User.findById(userId);
    if (user) {
      // Attach user info for both regular users and admin/seller roles
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      // For backward compatibility, also attach as admin if user has admin/seller role
      if (user.role === "admin" || user.role === "seller") {
        req.admin = {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }

      console.log("User authenticated:", {
        id: user._id,
        role: user.role,
        email: user.email,
      });
      return next();
    }

    return res.status(403).json({
      status: "fail",
      error: "Invalid token",
    });
  } catch (error) {
    res.status(403).json({
      status: "fail",
      error: "Invalid token",
    });
  }
};
