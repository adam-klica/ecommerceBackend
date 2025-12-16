require("dotenv").config();

const connectDB = require("./config/db");

const Brand = require("./model/Brand");
const brandData = require("./utils/brands");

const Category = require("./model/Category");
const categoryData = require("./utils/categories");

const Products = require("./model/Products");
const productsData = require("./utils/products");

const Order = require("./model/Order");
const orderData = require("./utils/orders");

const User = require("./model/User");
const userData = require("./utils/users");

const Reviews = require("./model/Review");
const reviewsData = require("./utils/reviews");

connectDB();
const importData = async () => {
  try {
    await Brand.deleteMany();
    await Brand.insertMany(brandData);

    await Category.deleteMany();
    await Category.insertMany(categoryData);

    await Products.deleteMany();
    await Products.insertMany(productsData);

    await Order.deleteMany();
    await Order.insertMany(orderData);

    await User.deleteMany();
    await User.insertMany(userData);

    await Reviews.deleteMany();
    await Reviews.insertMany(reviewsData);

    console.log("data inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};

importData();
