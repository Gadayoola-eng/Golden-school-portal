const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine - easily pluggable for S3 / Cloudinary
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique sanitized filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common assignment submission files
  const allowedExtensions = /\.(pdf|doc|docx|txt|rtf|zip|png|jpg|jpeg|gif|py|js|java|cpp|c|html|css|json|md)$/i;
  if (!file.originalname.match(allowedExtensions)) {
    return cb(new Error('Unsupported file type. Please upload a PDF, document, text file, code archive, or image.'));
  }
  cb(null, true);
};

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  },
  fileFilter,
});

// Storage service helper to easily swap to S3 / Cloudinary in production
const storageService = {
  getFileUrl: (req, filename) => {
    if (!filename) return null;
    return `/uploads/${filename}`;
  },
  deleteFile: (filename) => {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  },
};

module.exports = {
  upload,
  storageService,
};
