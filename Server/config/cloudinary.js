const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Check if Cloudinary credentials are present
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingEnvVars);
  throw new Error('Missing Cloudinary configuration');
}

// Configure Cloudinary with logging
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('Cloudinary configured successfully');
  
  // Test the configuration
  cloudinary.api.ping()
    .then(result => {
      console.log('Cloudinary connection test successful:', result);
    })
    .catch(error => {
      console.error('Cloudinary connection test failed:', error);
      throw error;
    });
} catch (error) {
  console.error('Error configuring Cloudinary:', error);
  throw error;
}

module.exports = cloudinary;
