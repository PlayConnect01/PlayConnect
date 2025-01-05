const express = require('express');
const router = express.Router();
const { upload, handleUpload } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Test route
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
      message: 'Error in test route'
    });
  }
});

// Upload route - first protect, then handle file upload, then process
router.post('/', protect, upload, handleUpload);

module.exports = router;
