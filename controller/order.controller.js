const { secret } = require("../config/secret");
const Order = require("../model/Order");

// Note: Payment intent removed - all products are free
// addOrder - All products are now free
exports.addOrder = async (req, res, next) => {
  try {
    const Product = require("../model/Products");
    
    // Make all products free - set prices to 0
    if (req.body.cart && Array.isArray(req.body.cart)) {
      req.body.cart = req.body.cart.map(item => ({
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
  }
  catch (error) {
    console.log(error);
    next(error)
  }
};
// get Orders
exports.getOrders = async (req, res, next) => {
  try {
    const orderItems = await Order.find({}).populate('user');
    res.status(200).json({
      success: true,
      data: orderItems,
    });
  }
  catch (error) {
    console.log(error);
    next(error)
  }
};
// get Orders
exports.getSingleOrder = async (req, res, next) => {
  try {
    const orderItem = await Order.findById(req.params.id).populate('user');
    res.status(200).json(orderItem);
  }
  catch (error) {
    console.log(error);
    next(error)
  }
};

exports.updateOrderStatus = async (req, res) => {
  const newStatus = req.body.status;
  try {
    await Order.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: newStatus,
        },
      }, { new: true })
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
    });
  }
  catch (error) {
    console.log(error);
    next(error)
  }
};
