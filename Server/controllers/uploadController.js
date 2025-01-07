const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage with better error handling
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file presence
    if (!file) {
      cb(new Error('No file uploaded'));
      return;
    }

    // Verify mimetype
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`));
      return;
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
      return;
    }

    cb(null, true);
  }
}).single('image');

/**
 * Handle image upload to Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleUpload = async (req, res) => {
  try {
    // Verify authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify file presence
    if (!req.file && !req.body.image) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    let uploadResult;
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'playconnect/products',
      timeout: 60000, // 60 seconds timeout
      quality: 'auto:good', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
    };

    try {
      if (req.file) {
        // Handle multipart form data upload
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions);
      } else {
        // Handle base64 image upload
        if (!req.body.image.startsWith('data:image/')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid base64 image format'
          });
        }
        uploadResult = await cloudinary.uploader.upload(req.body.image, uploadOptions);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: 'Error uploading to cloud storage',
        error: process.env.NODE_ENV === 'development' ? cloudinaryError.message : 'Upload failed'
      });
    }

    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from cloud storage'
      });
    }

    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      message: 'Upload successful'
    });

  } catch (error) {
    console.error('Upload error:', error);
    let status = 500;
    let message = 'Internal server error';

    if (error instanceof multer.MulterError) {
      status = 400;
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File size exceeds 5MB limit';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files uploaded';
          break;
        default:
          message = error.message;
      }
    } else if (error.name === 'ValidationError') {
      status = 400;
      message = 'Invalid input data';
    }

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export both middleware and handler
module.exports = {
  upload,
  handleUpload
};