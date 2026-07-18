import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary (requires CLOUDINARY_URL in .env)
cloudinary.config({
  secure: true
});

// Fallback: Ensure uploads directory exists for local dev
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use Cloudinary in production or if configured, else use local disk
const storage = process.env.CLOUDINARY_URL 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        return {
          folder: 'career-copilot/resumes',
          format: 'pdf', // force format or use file.mimetype
          public_id: `resume-${Date.now()}`,
          resource_type: 'raw' // Required for non-image files like PDF/DOCX
        };
      },
    })
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `resume-${uniqueSuffix}${ext}`);
      },
    });

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc (legacy)
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});
