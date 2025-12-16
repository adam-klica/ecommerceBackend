const express = require("express");
const { fileUpload } = require("../controller/upload.controller");
const uploader = require("../middleware/uploder");

const router = express.Router();

// routes
router.post("/single", uploader.single("file"), fileUpload);
router.post("/image", uploader.single("image"), fileUpload);

module.exports = router;
