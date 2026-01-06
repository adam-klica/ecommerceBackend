const { secret } = require("../config/secret");
const Order = require("../model/Order");
const orderInvoicePdf = require("../utils/orderInvoicePdf");

// Note: Payment intent removed - all products are free
// addOrder - All products are now free
exports.addOrder = async (req, res, next) => {
  try {
    const Product = require("../model/Products");

    // Make all products free - set prices to 0
    if (req.body.cart && Array.isArray(req.body.cart)) {
      req.body.cart = req.body.cart.map((item) => ({
        ...item,
        price: 0,
      }));
    }

    // Set all costs to 0 (all products are free)
    req.body.subTotal = 0;
    req.body.shippingCost = 0;
    req.body.discount = 0;
    req.body.totalAmount = 0;

    // Payment method defaults to "free" since all products are free
    if (!req.body.paymentMethod) {
      req.body.paymentMethod = "free";
    }

    // User is optional for free orders
    // If no user provided, order can still be created

    const orderItems = await Order.create(req.body);

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
      orderItems = await Order.find({
        "cart._id": { $in: myProductIds },
      }).populate("user");
    } else {
      orderItems = await Order.find({}).populate("user");
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
      trackingUrl,
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
    if (trackingUrl !== undefined)
      update.trackingUrl = trackingUrl || undefined;
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
