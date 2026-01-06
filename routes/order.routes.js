const express = require("express");
const {
  addOrder,
  getOrders,
  updateOrderStatus,
  getSingleOrder,
} = require("../controller/order.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");

// router
const router = express.Router();

// get orders
router.get("/orders", verifyAdminToken, getOrders);
// single order
router.get("/:id", verifyAdminToken, getSingleOrder);
// save Order (no payment needed - all products are free)
router.post("/saveOrder", addOrder);
// update status
router.patch("/update-status/:id", verifyAdminToken, updateOrderStatus);

module.exports = router;
