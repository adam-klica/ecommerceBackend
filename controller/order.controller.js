const { secret } = require("../config/secret");
const Order = require("../model/Order");
const orderInvoicePdf = require("../utils/orderInvoicePdf");
const { sendOrderNotifications } = require("../utils/orderEmailNotification");

// addOrder - Cash on Delivery (no online payment required)
exports.addOrder = async (req, res, next) => {
  try {
    // Keep original prices for display in emails and PDFs
    // Payment is collected on delivery (Cash on Delivery)

    // Set shipping cost to 0 (free shipping)
    req.body.shippingCost = 0;

    // Payment method defaults to "Cash on Delivery"
    if (!req.body.paymentMethod) {
      req.body.paymentMethod = "Cash on Delivery";
    }

    // User is optional for guest checkout
    // If no user provided, order can still be created

    const orderItems = await Order.create(req.body);

    // Send email notifications to buyer and seller(s) - don't await to avoid blocking response
    sendOrderNotifications(orderItems).catch((err) => {
      console.error("Failed to send order notifications:", err.message);
    });

    res.status(200).json({
      success: true,
      message: "Order added successfully",
      order: orderItems,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// get Orders
exports.getOrders = async (req, res, next) => {
  try {
    let orderItems;

    if (req.user?.role?.toLowerCase() === "seller") {
      const Product = require("../model/Products");
      const myProductIds = await Product.find({
        createdBy: req.user.id,
      }).distinct("_id");
      // Convert ObjectIds to strings for comparison with cart items
      const myProductIdStrings = myProductIds.map((id) => id.toString());
      // Find orders where any cart item's _id matches seller's products
      const allOrders = await Order.find({})
        .populate("user")
        .sort({ createdAt: -1 });

      console.log("Seller debug:", {
        sellerId: req.user.id,
        sellerProductCount: myProductIdStrings.length,
        sellerProductIds: myProductIdStrings.slice(0, 5),
        totalOrders: allOrders.length,
        sampleCartIds: allOrders[0]?.cart?.map((item) => item._id).slice(0, 3),
      });

      // Filter orders that contain at least one of seller's products
      orderItems = allOrders.filter((order) =>
        Array.isArray(order.cart) &&
        order.cart.some((item) => myProductIdStrings.includes(String(item._id)))
      );
      console.log("Filtered orders for seller:", orderItems.length);
    } else {
      orderItems = await Order.find({}).populate("user").sort({ createdAt: -1 });
    }
    res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// get Orders
exports.getSingleOrder = async (req, res, next) => {
  try {
    const orderItem = await Order.findById(req.params.id).populate("user");

    if (req.user?.role?.toLowerCase() === "seller") {
      const Product = require("../model/Products");
      const myProductIds = await Product.find({
        createdBy: req.user.id,
      }).distinct("_id");
      const hasMyItems = Array.isArray(orderItem?.cart)
        ? orderItem.cart.some((item) =>
            myProductIds.some(
              (pid) => pid?.toString() === item?._id?.toString()
            )
          )
        : false;

      if (!orderItem || !hasMyItems) {
        return res.status(403).json({
          status: "fail",
          error: "You are not authorized to access this order.",
        });
      }
    }
    res.status(200).json(orderItem);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// export order invoice as PDF (admin/seller)
exports.exportOrderPdf = async (req, res, next) => {
  try {
    const orderItem = await Order.findById(req.params.id).populate("user");

    if (req.user?.role?.toLowerCase() === "seller") {
      const Product = require("../model/Products");
      const myProductIds = await Product.find({
        createdBy: req.user.id,
      }).distinct("_id");
      const hasMyItems = Array.isArray(orderItem?.cart)
        ? orderItem.cart.some((item) =>
            myProductIds.some(
              (pid) => pid?.toString() === item?._id?.toString()
            )
          )
        : false;

      if (!orderItem || !hasMyItems) {
        return res.status(403).json({
          status: "fail",
          error: "You are not authorized to access this order.",
        });
      }
    }

    if (!orderItem) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    return orderInvoicePdf({ res, order: orderItem });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    if (req.user?.role?.toLowerCase() === "seller") {
      const Product = require("../model/Products");
      const myProductIds = await Product.find({
        createdBy: req.user.id,
      }).distinct("_id");
      const orderItem = await Order.findById(req.params.id).select("cart");
      const hasMyItems = Array.isArray(orderItem?.cart)
        ? orderItem.cart.some((item) =>
            myProductIds.some(
              (pid) => pid?.toString() === item?._id?.toString()
            )
          )
        : false;
      if (!orderItem || !hasMyItems) {
        return res.status(403).json({
          status: "fail",
          error: "You are not authorized to update this order.",
        });
      }
    }
    await Order.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: newStatus,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// update order (admin/seller): status + tracking + admin note
exports.updateOrderAdmin = async (req, res, next) => {
  try {
    const validStatuses = ["pending", "processing", "delivered", "cancel"];

    const orderItem = await Order.findById(req.params.id).select(
      "cart shippedAt deliveredAt"
    );
    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user?.role?.toLowerCase() === "seller") {
      const Product = require("../model/Products");
      const myProductIds = await Product.find({
        createdBy: req.user.id,
      }).distinct("_id");
      const hasMyItems = Array.isArray(orderItem?.cart)
        ? orderItem.cart.some((item) =>
            myProductIds.some(
              (pid) => pid?.toString() === item?._id?.toString()
            )
          )
        : false;
      if (!hasMyItems) {
        return res.status(403).json({
          status: "fail",
          error: "You are not authorized to update this order.",
        });
      }
    }

    const {
      status,
      carrier,
      trackingNumber,
      adminNote,
      shippedAt,
      deliveredAt,
    } = req.body || {};

    const update = {};

    if (status !== undefined) {
      const normalizedStatus = String(status).toLowerCase();
      if (!validStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      update.status = normalizedStatus;

      if (
        normalizedStatus === "processing" &&
        !orderItem.shippedAt &&
        shippedAt === undefined
      ) {
        update.shippedAt = new Date();
      }
      if (
        normalizedStatus === "delivered" &&
        !orderItem.deliveredAt &&
        deliveredAt === undefined
      ) {
        update.deliveredAt = new Date();
      }
    }

    if (carrier !== undefined) update.carrier = carrier || undefined;
    if (trackingNumber !== undefined)
      update.trackingNumber = trackingNumber || undefined;
    if (adminNote !== undefined) update.adminNote = adminNote || undefined;

    if (shippedAt !== undefined)
      update.shippedAt = shippedAt ? new Date(shippedAt) : undefined;
    if (deliveredAt !== undefined)
      update.deliveredAt = deliveredAt ? new Date(deliveredAt) : undefined;

    const saved = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};
