const path = require("path");
const fs = require("fs");
const News = require("../model/News");

const slugify = (str) => {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const getBaseUrl = () => {
  return (
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 7000}`
  );
};

const buildImageUrl = (filename) => {
  if (!filename) return undefined;
  return `${getBaseUrl()}/api/uploads/${filename}`;
};

const tryDeleteFile = async (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "public", "images", filename);
  try {
    await fs.promises.unlink(filePath);
  } catch (_) {
    // ignore
  }
};

exports.getNewsList = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "6", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const onlyPublished = req.query.published === "false" ? false : true;

    const filter = onlyPublished ? { published: true } : {};

    const [items, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getNewsBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const news = await News.findOne({ slug, published: true });
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }
    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminNewsList = async (req, res, next) => {
  try {
    const items = await News.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

exports.createNews = async (req, res, next) => {
  try {
    const { title, excerpt, content, published } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const baseSlug = slugify(title);
    if (!baseSlug) {
      return res.status(400).json({
        success: false,
        message: "Invalid title",
      });
    }

    let slug = baseSlug;
    let counter = 1;
    while (await News.exists({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    let featuredImageUrl;
    let featuredImageFilename;

    if (req.file?.filename) {
      featuredImageFilename = req.file.filename;
      featuredImageUrl = buildImageUrl(req.file.filename);
    }

    const doc = await News.create({
      title: String(title).trim(),
      slug,
      excerpt: excerpt ? String(excerpt).trim() : undefined,
      content: String(content),
      featuredImageUrl,
      featuredImageFilename,
      published: published === undefined ? true : String(published) !== "false",
      createdBy: req.user?.id || req.admin?.id,
    });

    res.status(201).json({
      success: true,
      message: "News created",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    const { title, excerpt, content, published } = req.body || {};

    if (title !== undefined) {
      news.title = String(title).trim();
    }
    if (excerpt !== undefined) {
      news.excerpt = excerpt ? String(excerpt).trim() : undefined;
    }
    if (content !== undefined) {
      news.content = String(content);
    }
    if (published !== undefined) {
      news.published = String(published) !== "false";
    }

    if (req.file?.filename) {
      const oldFilename = news.featuredImageFilename;
      news.featuredImageFilename = req.file.filename;
      news.featuredImageUrl = buildImageUrl(req.file.filename);
      await tryDeleteFile(oldFilename);
    }

    const saved = await news.save();

    res.status(200).json({
      success: true,
      message: "News updated",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    const filename = news.featuredImageFilename;
    await News.deleteOne({ _id: id });
    await tryDeleteFile(filename);

    res.status(200).json({
      success: true,
      message: "News deleted",
    });
  } catch (error) {
    next(error);
  }
};
