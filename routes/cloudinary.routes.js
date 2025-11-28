const express = require('express');
const router = express.Router();
// internal
const uploader = require('../middleware/uploder');
const { cloudinaryController } = require('../controller/cloudinary.controller');
const digitalFileUploader = require('../middleware/digital-file-uploader');
const multer = require('multer');

const upload = multer();
//add image
router.post('/add-img',upload.single('image'), cloudinaryController.saveImageCloudinary);

//add image
router.post('/add-multiple-img',upload.array('images',5), cloudinaryController.addMultipleImageCloudinary);

//upload digital file (for digital products)
router.post('/upload-digital-file', digitalFileUploader.single('file'), cloudinaryController.uploadDigitalFile);

//delete image
router.delete('/img-delete', cloudinaryController.cloudinaryDeleteController);

module.exports = router;