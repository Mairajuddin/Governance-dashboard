import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Upload directory
const uploadDir = path.join('uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix);
  },
});

// File type filter
const imageUploadMiddleware = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype.startsWith('image/') &&
      (file.originalname.endsWith('.jpg') || file.originalname.endsWith('.jpeg') || file.originalname.endsWith('.png'))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG images are allowed!'), false);
    }
  },
});

export default imageUploadMiddleware;
