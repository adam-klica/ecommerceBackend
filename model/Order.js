const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for free orders
    },
    cart: [{}],
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
      default: "N/A",
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: false,
      default: "N/A",
    },

    city: {
      type: String,
      required: false,
      default: "N/A",
    },
    country: {
      type: String,
      required: false,
      default: "N/A",
    },
    zipCode: {
      type: String,
      required: false,
      default: "N/A",
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    paymentIntent: {
      type: Object,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false, // Optional for free orders
      default: "free",
    },
    orderNote: {
      type: String,
      required: false,
    },
    invoice: {
      type: Number,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered",'cancel'],
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// define pre-save middleware to generate the invoice number
orderSchema.pre('save', async function (next) {
  const order = this;
  if (!order.invoice) { // check if the order already has an invoice number
    try {
      // find the highest invoice number in the orders collection
      const highestInvoice = await mongoose
        .model('Order')
        .find({})
        .sort({ invoice: 'desc' })
        .limit(1)
        .select({ invoice: 1 });
      // if there are no orders in the collection, start at 1000
      const startingInvoice = highestInvoice.length === 0 ? 1000 : highestInvoice[0].invoice + 1;
      // set the invoice number for the new order
      order.invoice = startingInvoice;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
