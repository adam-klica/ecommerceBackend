const User = require("../model/User");
const Product = require("../model/Products");

// Get all sellers with product count
exports.getAllSellers = async (req, res, next) => {
  try {
    // Find all active sellers
    const sellers = await User.find({
      role: "seller",
      status: "active",
    }).select("_id name email imageURL bio createdAt");

    // Get product counts for each seller
    const sellersWithCount = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({
          createdBy: seller._id,
        });
        return {
          ...seller.toObject(),
          productCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: sellersWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get single seller by ID with product count
exports.getSellerById = async (req, res, next) => {
  try {
    const seller = await User.findOne({
      _id: req.params.id,
      role: "seller",
    }).select("_id name email imageURL bio createdAt");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const productCount = await Product.countDocuments({
      createdBy: seller._id,
    });

    res.status(200).json({
      success: true,
      data: {
        ...seller.toObject(),
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
