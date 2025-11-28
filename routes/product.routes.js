const express = require('express');
const router = express.Router();
// internal
const productController = require('../controller/product.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const checkProductAccess = require('../middleware/checkProductAccess');

// add a product (profesor or admin only)
router.post('/add', verifyAdminToken, checkProductAccess, productController.addProduct);
// add all product (profesor or admin only)
router.post('/add-all', verifyAdminToken, checkProductAccess, productController.addAllProducts);
// get all products
router.get('/all', productController.getAllProducts);
// get offer timer product
router.get('/offer', productController.getOfferTimerProducts);
// top rated products
router.get('/top-rated', productController.getTopRatedProducts);
// reviews products
router.get('/review-product', productController.reviewProducts);
// get popular products by type
router.get('/popular/:type', productController.getPopularProductByType);
// get Related Products
router.get('/related-product/:id', productController.getRelatedProducts);
// get Single Product
router.get("/single-product/:id", productController.getSingleProduct);
// stock Product
router.get("/stock-out", productController.stockOutProducts);
// edit product (profesor or admin only)
router.patch("/edit-product/:id", verifyAdminToken, checkProductAccess, productController.updateProduct);
// get Products ByType
router.get('/:type', productController.getProductsByType);
// delete product (profesor or admin only)
router.delete('/:id', verifyAdminToken, checkProductAccess, productController.deleteProduct);

module.exports = router;