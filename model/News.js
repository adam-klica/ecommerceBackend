const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: false,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImageUrl: {
      type: String,
      required: false,
    },
    featuredImageFilename: {
      type: String,
      required: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.models.News || mongoose.model("News", newsSchema);
module.exports = News;
