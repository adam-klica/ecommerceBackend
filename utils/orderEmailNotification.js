const nodemailer = require("nodemailer");
const { secret } = require("../config/secret");

const createTransporter = () => {
  console.log("[EMAIL] Creating transporter with config:", {
    host: secret.email_host,
    service: secret.email_service,
    port: secret.email_port,
    user: secret.email_user
      ? `${secret.email_user.substring(0, 3)}...`
      : "NOT SET",
    pass: secret.email_pass ? "SET" : "NOT SET",
  });

  return nodemailer.createTransport({
    host: secret.email_host,
    service: secret.email_service,
    port: secret.email_port,
    secure: true,
    auth: {
      user: secret.email_user,
      pass: secret.email_pass,
    },
  });
};

const sendOrderEmailToBuyer = async (order) => {
  console.log("[EMAIL] Starting sendOrderEmailToBuyer for order:", order._id);
  console.log("[EMAIL] Buyer email:", order.email);

  try {
    const transporter = createTransporter();

    const cartItemsHtml = order.cart
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${
            item.title || "Product"
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
            item.orderQuantity || 1
          }</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"South Adriatic Market" <${secret.email_user}>`,
      to: order.email,
      subject: `Order Confirmation #${order.invoice}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Thank you for your order!</h2>
          <p>Dear ${order.name},</p>
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> #${order.invoice}</p>
            <p><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          </div>
          
          <h3 style="color: #2c3e50;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${cartItemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
            <p><strong>Shipping Address:</strong></p>
            <p>${order.address}, ${order.city}, ${order.zipCode}, ${
        order.country
      }</p>
          </div>
          
          <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>South Adriatic Market Team</p>
        </div>
      `,
    };

    console.log("[EMAIL] Sending email to buyer...");
    const result = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Email sent to buyer successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email to buyer:", error.message);
    console.error("[EMAIL] Full error:", error);
    return false;
  }
};

const sendOrderEmailToSeller = async (seller, order, sellerItems) => {
  console.log(
    "[EMAIL] Starting sendOrderEmailToSeller for seller:",
    seller.email
  );

  try {
    const transporter = createTransporter();

    const cartItemsHtml = sellerItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${
            item.title || "Product"
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
            item.orderQuantity || 1
          }</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"South Adriatic Market" <${secret.email_user}>`,
      to: seller.email,
      subject: `New Order Received #${order.invoice}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">You have a new order!</h2>
          <p>Dear ${seller.name},</p>
          <p>A customer has ordered your product(s). Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> #${order.invoice}</p>
            <p><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${order.name}</p>
            <p><strong>Customer Email:</strong> ${order.email}</p>
          </div>
          
          <h3 style="color: #2c3e50;">Your Products in this Order:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${cartItemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
            <p><strong>Shipping Address:</strong></p>
            <p>${order.address}, ${order.city}, ${order.zipCode}, ${
        order.country
      }</p>
          </div>
          
          <p style="margin-top: 20px;">Please log in to your seller dashboard to manage this order.</p>
          <p>Best regards,<br>South Adriatic Market Team</p>
        </div>
      `,
    };

    console.log("[EMAIL] Sending email to seller...");
    const result = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Email sent to seller successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email to seller:", error.message);
    console.error("[EMAIL] Full error:", error);
    return false;
  }
};

const sendOrderNotifications = async (order) => {
  console.log("[EMAIL] ====== Starting sendOrderNotifications ======");
  console.log("[EMAIL] Order ID:", order._id);
  console.log("[EMAIL] Order invoice:", order.invoice);
  console.log("[EMAIL] Buyer email:", order.email);
  console.log("[EMAIL] Cart items count:", order.cart?.length || 0);

  const User = require("../model/User");
  const Product = require("../model/Products");

  try {
    // Send email to buyer
    console.log("[EMAIL] Sending confirmation to buyer...");
    const buyerResult = await sendOrderEmailToBuyer(order);
    console.log("[EMAIL] Buyer email result:", buyerResult);

    // Find unique sellers from cart items and send them emails
    const productIds = order.cart.map((item) => item._id).filter((id) => id);
    console.log("[EMAIL] Product IDs in cart:", productIds);

    if (productIds.length === 0) {
      console.log(
        "[EMAIL] No product IDs found, skipping seller notifications"
      );
      return;
    }

    // Get products with their creators (sellers)
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id createdBy")
      .lean();

    // Group cart items by seller
    const sellerItemsMap = new Map();

    for (const cartItem of order.cart) {
      const product = products.find(
        (p) => p._id.toString() === cartItem._id?.toString()
      );
      if (product?.createdBy) {
        const sellerId = product.createdBy.toString();
        if (!sellerItemsMap.has(sellerId)) {
          sellerItemsMap.set(sellerId, []);
        }
        sellerItemsMap.get(sellerId).push(cartItem);
      }
    }

    // Get seller details and send emails
    const sellerIds = Array.from(sellerItemsMap.keys());
    console.log("[EMAIL] Seller IDs found:", sellerIds);

    if (sellerIds.length === 0) {
      console.log("[EMAIL] No sellers found, skipping seller notifications");
      return;
    }

    const sellers = await User.find({ _id: { $in: sellerIds } })
      .select("_id name email")
      .lean();
    console.log(
      "[EMAIL] Sellers found:",
      sellers.map((s) => ({ id: s._id, email: s.email }))
    );

    for (const seller of sellers) {
      const sellerItems = sellerItemsMap.get(seller._id.toString());
      if (sellerItems && sellerItems.length > 0) {
        console.log("[EMAIL] Sending notification to seller:", seller.email);
        await sendOrderEmailToSeller(seller, order, sellerItems);
      }
    }
    console.log("[EMAIL] ====== sendOrderNotifications completed ======");
  } catch (error) {
    console.error("[EMAIL] Error sending order notifications:", error.message);
    console.error("[EMAIL] Full error:", error);
  }
};

module.exports = {
  sendOrderEmailToBuyer,
  sendOrderEmailToSeller,
  sendOrderNotifications,
};
