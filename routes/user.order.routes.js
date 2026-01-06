const express = require("express");
const router = express.Router();
const userOrderController = require("../controller/user.order.controller");
const verifyToken = require("../middleware/verifyToken");

// get dashboard amount
router.get("/dashboard-amount", userOrderController.getDashboardAmount);

// get sales-report
router.get("/sales-report", userOrderController.getSalesReport);

// get sales-report
router.get("/most-selling-category", userOrderController.mostSellingCategory);

// get sales-report
router.get(
  "/dashboard-recent-order",
  userOrderController.getDashboardRecentOrder
);

// public routes (no auth required - for guest checkout)
router.get("/public/:id/pdf", userOrderController.exportOrderPdfPublic);
router.get("/public/:id", userOrderController.getOrderByIdPublic);

//get a order by id (authenticated)
router.get("/:id/pdf", verifyToken, userOrderController.exportUserOrderPdf);
router.get("/:id", verifyToken, userOrderController.getOrderById);

//get all order by a user
router.get("/", verifyToken, userOrderController.getOrderByUser);

module.exports = router;
