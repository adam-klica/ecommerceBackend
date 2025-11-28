const { secret } = require("../config/secret");
const cloudinary = require("../utils/cloudinary");
const { Readable } = require('stream');

const cloudinaryImageUpload = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    // Use signed upload (no preset needed when using API secret)
    const uploadOptions = {};
    
    // Only use upload_preset if it's explicitly set and not the default 'unsigned'
    if (secret.cloudinary_upload_preset && secret.cloudinary_upload_preset !== 'unsigned') {
      uploadOptions.upload_preset = secret.cloudinary_upload_preset;
    } else {
      // For signed uploads, specify folder
      uploadOptions.folder = 'products';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(imageBuffer);
    bufferStream.push(null);

    bufferStream.pipe(uploadStream);
  });
};

// cloudinaryFileUpload - for digital products (PDF, ZIP, etc.)
const cloudinaryFileUpload = (fileBuffer, originalName, resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    // Use signed upload (no preset needed when using API secret)
    const uploadOptions = {
      resource_type: resourceType,
      folder: 'digital-products',
      use_filename: true,
      unique_filename: true,
    };
    
    // Only use upload_preset if it's explicitly set and not the default 'unsigned'
    if (secret.cloudinary_upload_preset && secret.cloudinary_upload_preset !== 'unsigned') {
      uploadOptions.upload_preset = secret.cloudinary_upload_preset;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Error uploading file to Cloudinary:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    bufferStream.pipe(uploadStream);
  });
};

// cloudinaryImageDelete
const cloudinaryImageDelete = async (public_id) => {
  const deletionResult = await cloudinary.uploader.destroy(public_id);
  return deletionResult;
};

// cloudinaryFileDelete - for digital files
const cloudinaryFileDelete = async (public_id, resourceType = 'raw') => {
  const deletionResult = await cloudinary.uploader.destroy(public_id, {
    resource_type: resourceType
  });
  return deletionResult;
};

exports.cloudinaryServices = {
  cloudinaryImageDelete,
  cloudinaryImageUpload,
  cloudinaryFileUpload,
  cloudinaryFileDelete,
};
