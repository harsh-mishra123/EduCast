const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFormats = ['mp4', 'mov', 'avi', 'mkv'];
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format. Allowed: ${allowedFormats.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2097152000 // 2GB
  }
});

module.exports = upload;
