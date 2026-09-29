const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only images and PDF allowed.'), false);
};

const limits = { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 };

const uploadProfile = multer({ storage: createStorage('profiles'), fileFilter, limits });
const uploadMeal = multer({ storage: createStorage('meals'), fileFilter, limits });
const uploadPost = multer({ storage: createStorage('posts'), fileFilter, limits });
const uploadMedical = multer({ storage: createStorage('medical'), fileFilter, limits });
const uploadProgress = multer({ storage: createStorage('progress'), fileFilter, limits });

module.exports = { uploadProfile, uploadMeal, uploadPost, uploadMedical, uploadProgress };
