/**
 * Multer middleware for handling image file uploads.
 * Stores files in a temporary directory; the controller is responsible for moving them to their final location.
 * Accepts only image MIME types (jpeg, png, gif, webp, svg) up to 5 MB.
 */
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

import { mediaRoot } from '../utils/assets';

const UPLOAD_TEMP_DIR = path.join(mediaRoot, 'temp');

// Ensure the temp directory exists before the first request arrives
fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Only images are accepted.'));
  }
};

/**
 * Configured multer instance.
 * Use as `uploadMiddleware.single('file')` in route definitions.
 */
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

