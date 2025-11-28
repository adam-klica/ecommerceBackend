const multer = require("multer");
const path = require("path");

// Memory storage for digital files (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

const digitalFileUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Supported digital file types
    const supportedFiles = /pdf|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|txt|epub|mobi|mp3|mp4|avi|mov|wmv|flv|mkv/;
    const extension = path.extname(file.originalname).toLowerCase().substring(1);

    if (supportedFiles.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${extension} is not supported. Supported types: PDF, ZIP, RAR, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, EPUB, MOBI, MP3, MP4, AVI, MOV, WMV, FLV, MKV`));
    }
  },
  limits: {
    fileSize: 500000000, // 500MB limit for digital files
  }
});

module.exports = digitalFileUploader;

