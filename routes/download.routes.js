const express = require("express");
const router = express.Router();
const downloadController = require("../controller/download.controller");
// Note: Downloads are free and public, but authentication is optional for tracking

// Get download link for a specific digital product (free - optional authentication for tracking)
router.get("/product/:productId", downloadController.downloadDigitalProduct);

// Get all downloadable products - returns all digital products (free)
router.get("/my-downloads", downloadController.getAllDigitalProducts);

module.exports = router;
