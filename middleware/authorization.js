module.exports = (...role) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({
        status: "fail",
        error: "You are not logged in",
      });
    }
    if (!role.includes(userRole)) {
      return res.status(403).json({
        status: "fail",
        error: "You are not authorized to access this",
      });
    }

    next();
  };
};
