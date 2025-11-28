const Order = require("../model/Order");
const Product = require("../model/Products");
const User = require("../model/User");
const mongoose = require("mongoose");

// Helper to get user from token (optional authentication)
const getUserFromToken = async (req) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];
    if (!token) return null;
    
    const jwt = require("jsonwebtoken");
    const { promisify } = require("util");
    const { secret } = require("../config/secret");
    
    const decoded = await promisify(jwt.verify)(token, secret.token_secret);
    const userId = decoded._id || decoded.id;
    if (!userId) return null;
    
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    return null;
  }
};

// Download digital product (free - no purchase verification required)
// Automatically creates an order for tracking downloads
exports.downloadDigitalProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is digital
    if (!product.isDigital) {
      return res.status(400).json({
        success: false,
        message: "This product is not a digital product",
      });
    }

    // Check if download file exists
    if (!product.downloadFile || !product.downloadFile.url) {
      return res.status(404).json({
        success: false,
        message: "Download file not available",
      });
    }

    // Try to get user from token (optional)
    let user = null;
    try {
      user = await getUserFromToken(req);
    } catch (err) {
      // User not authenticated - continue without user
    }

    // Create order for tracking downloads
    try {
      const orderData = {
        user: user?._id || null,
        cart: [{
          _id: product._id,
          title: product.title,
          price: 0,
          orderQuantity: 1,
          isDigital: true,
          downloadFile: product.downloadFile,
        }],
        name: user?.name || "Guest User",
        email: user?.email || "guest@example.com",
        address: user?.address || "N/A",
        contact: user?.contactNumber || "N/A",
        city: user?.city || "N/A",
        country: user?.country || "N/A",
        zipCode: user?.zipCode || "N/A",
        subTotal: 0,
        shippingCost: 0,
        discount: 0,
        totalAmount: 0,
        shippingOption: "free",
        paymentMethod: "free",
        status: "delivered",
        orderNote: "Digital download",
      };

      await Order.create(orderData);

      // Increment product download count
      await Product.findByIdAndUpdate(productId, {
        $inc: { sellCount: 1 }
      });
    } catch (orderError) {
      console.error("Error creating download order:", orderError);
      // Continue even if order creation fails
    }

    // Return download information
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: product.downloadFile.url,
        fileName: product.downloadFile.fileName || product.title,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all downloadable digital products (free - returns all digital products)
exports.getAllDigitalProducts = async (req, res, next) => {
  try {
    // Find all digital products with download files
    const digitalProducts = await Product.find({
      isDigital: true,
      "downloadFile.url": { $exists: true, $ne: null }
    }).select("_id title img downloadFile");

    const downloadableProducts = digitalProducts.map(product => ({
      productId: product._id,
      title: product.title,
      img: product.img,
      downloadFile: product.downloadFile,
    }));

    res.status(200).json({
      success: true,
      data: downloadableProducts,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

