const express = require("express");
const router = express.Router();
const sellerController = require("../controller/seller.controller");

// Get all sellers (public, no auth required)
router.get("/", sellerController.getAllSellers);

// Get single seller by ID (public, no auth required)
router.get("/:id", sellerController.getSellerById);

module.exports = router;
