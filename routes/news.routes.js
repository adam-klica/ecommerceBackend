const express = require("express");
const router = express.Router();
const newsController = require("../controller/news.controller");

// Public: list latest news
router.get("/", newsController.getNewsList);

// Public: get by slug
router.get("/:slug", newsController.getNewsBySlug);

module.exports = router;
