const express = require('express');
const router = express.Router();
const { upload, handleUpload } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /upload/test
 * @desc    Test upload route
 * @access  Public
 */
router.get('/test', (req, res) => {
  try {
    res.json({ 
      success: true,
      message: 'Upload route is working!' 
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in test route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /upload
 * @desc    Upload an image to Cloudinary
 * @access  Private
 */
router.post('/', verifyToken, (req, res, next) => {
  console.log('Upload request received');
  console.log('Headers:', req.headers);
  
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error processing file upload'
      });
    }
    
    console.log('File processed by multer:', req.file ? 'Present' : 'Missing');
    if (req.file) {
      console.log('File details:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    
    // Pass to the next middleware (handleUpload)
    next();
  });
}, handleUpload);

module.exports = router;