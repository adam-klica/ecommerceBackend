const Product = require("../model/Products");
const User = require("../model/User");
const News = require("../model/News");

const escapeRegex = (s) =>
  String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRegex = (q) => {
  const text = String(q || "").trim();
  if (!text) return null;
  return new RegExp(escapeRegex(text), "i");
};

const normalizeCategory = (c) =>
  String(c || "")
    .trim()
    .toLowerCase();

exports.search = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const type = String(req.query.type || "all").toLowerCase();

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "12", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const category = req.query.category
      ? normalizeCategory(req.query.category)
      : null;

    const regex = buildRegex(q);
    if (!regex) {
      return res.status(200).json({
        success: true,
        data: type === "all" ? { products: [], stores: [], news: [] } : [],
        meta:
          type === "all" ? undefined : { page, limit, total: 0, totalPages: 1 },
      });
    }

    // Products query
    const productMatch = {
      $or: [
        { title: regex },
        { description: regex },
        { parent: regex },
        { children: regex },
        { tags: regex },
      ],
    };

    if (category) {
      productMatch.$and = [
        {
          $or: [
            { parent: new RegExp(`^${escapeRegex(category)}$`, "i") },
            { children: new RegExp(`^${escapeRegex(category)}$`, "i") },
            { "category.name": new RegExp(`^${escapeRegex(category)}$`, "i") },
          ],
        },
      ];
    }

    // Stores (seller users)
    const storeMatch = {
      role: "seller",
      $or: [{ name: regex }, { email: regex }, { bio: regex }],
    };

    // News
    const newsMatch = {
      published: true,
      $or: [{ title: regex }, { excerpt: regex }, { content: regex }],
    };

    if (type === "products") {
      const [items, total] = await Promise.all([
        Product.find(productMatch)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(productMatch),
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    if (type === "stores") {
      const [items, total] = await Promise.all([
        User.find(storeMatch)
          .select("name email imageURL bio createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(storeMatch),
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    if (type === "news") {
      const [items, total] = await Promise.all([
        News.find(newsMatch)
          .select("title slug excerpt featuredImageUrl createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        News.countDocuments(newsMatch),
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    // all
    const limitPerType = Math.min(limit, 8);

    const [products, stores, news] = await Promise.all([
      Product.find(productMatch).sort({ createdAt: -1 }).limit(limitPerType),
      User.find(storeMatch)
        .select("name email imageURL bio createdAt")
        .sort({ createdAt: -1 })
        .limit(limitPerType),
      News.find(newsMatch)
        .select("title slug excerpt featuredImageUrl createdAt")
        .sort({ createdAt: -1 })
        .limit(limitPerType),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        stores,
        news,
      },
    });
  } catch (error) {
    next(error);
  }
};
