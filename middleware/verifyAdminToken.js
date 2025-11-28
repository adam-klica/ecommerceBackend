const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { secret } = require("../config/secret");
const Admin = require("../model/Admin");
const User = require("../model/User");

/**
 * Verify token and attach user/admin info to request
 * Works with both User and Admin tokens
 */
module.exports = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];

    if(!token){
      return res.status(401).json({
        status: "fail",
        error: "You are not logged in"
      });
    }
    
    const decoded = await promisify(jwt.verify)(token, secret.token_secret);
    
    // Get ID from token (could be _id or id)
    const userId = decoded._id || decoded.id;
    
    if (!userId) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid token format"
      });
    }

    // Try to find as Admin first
    const admin = await Admin.findById(userId);
    if (admin) {
      req.admin = {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      };
      console.log('Admin authenticated:', { id: admin._id, role: admin.role, email: admin.email });
      return next();
    }

    // Try to find as User
    const user = await User.findById(userId);
    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
      console.log('User authenticated:', { id: user._id, role: user.role, email: user.email });
      return next();
    }

    return res.status(403).json({
      status: "fail",
      error: "Invalid token"
    });

  } catch (error) {
    res.status(403).json({
      status: "fail",
      error: "Invalid token"
    });
  }
};

