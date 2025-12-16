exports.fileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Construct the URL for the uploaded file
    const baseUrl =
      process.env.API_BASE_URL ||
      `http://localhost:${process.env.PORT || 7000}`;
    const imageUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};
