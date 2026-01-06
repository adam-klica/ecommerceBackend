const express = require("express");
const router = express.Router();
const verifyAdminToken = require("../middleware/verifyAdminToken");
const checkAdminAccess = require("../middleware/checkAdminAccess");
const {
  registerAdmin,
  loginAdmin,
  updateStaff,
  changePassword,
  addStaff,
  getAllStaff,
  deleteStaff,
  getStaffById,
  forgetPassword,
  confirmAdminEmail,
  confirmAdminForgetPass,
  getAllUsers,
  getUserById,
  deleteUser,
  createUser,
  updateUserById,
  getCustomerReports,
} = require("../controller/admin.controller");

//register a staff
router.post("/register", registerAdmin);

//login a admin
router.post("/login", loginAdmin);

//login a admin
router.patch("/change-password", changePassword);

//login a admin
router.post("/add", addStaff);

//login a admin
router.get("/all", getAllStaff);

//forget-password
router.patch("/forget-password", forgetPassword);

//forget-password
router.patch("/confirm-forget-password", confirmAdminForgetPass);

//get a staff
router.get("/get/:id", getStaffById);

// update a staff
router.patch("/update-stuff/:id", updateStaff);

//update staf status
// router.put("/update-status/:id", updatedStatus);

//delete a staff
router.delete("/staff/:id", deleteStaff);

// User management endpoints (admin only)
// Create user (buyer or seller)
router.post("/users/create", verifyAdminToken, checkAdminAccess, createUser);
// Get all users (must come before /users/:id)
router.get("/users/all", verifyAdminToken, checkAdminAccess, getAllUsers);
// Get user by ID
router.get("/users/:id", verifyAdminToken, checkAdminAccess, getUserById);
// Update user by ID
router.patch("/users/:id", verifyAdminToken, checkAdminAccess, updateUserById);
// Delete user
router.delete("/users/:id", verifyAdminToken, checkAdminAccess, deleteUser);

router.get(
  "/reports/customers",
  verifyAdminToken,
  checkAdminAccess,
  getCustomerReports
);

module.exports = router;
