const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary from CLOUDINARY_URL environment variable
// Format: cloudinary://api_key:api_secret@cloud_name
// Cloudinary SDK automatically reads CLOUDINARY_URL if set correctly
if (process.env.CLOUDINARY_URL) {
  try {
    // Cloudinary SDK will automatically parse CLOUDINARY_URL
    // But we'll also parse it manually to ensure it works
    const url = process.env.CLOUDINARY_URL.trim();
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

    if (match) {
      cloudinary.config({
        cloud_name: match[3].trim(),
        api_key: match[1].trim(),
        api_secret: match[2].trim(),
      });
      console.log('✅ Cloudinary configured successfully');
    } else {
      // Fallback: Let Cloudinary SDK try to parse it automatically
      cloudinary.config();
      console.log('✅ Cloudinary configured (using SDK auto-config)');
    }
  } catch (e) {
    console.error('❌ Error configuring Cloudinary:', e.message);
  }
} else {
  console.warn('⚠️  CLOUDINARY_URL not found in environment variables');
}

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to upload to Cloudinary
async function uploadToCloudinary(buffer, folder = 'moments') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = { upload, uploadToCloudinary };
