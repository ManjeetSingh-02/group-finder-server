// import local modules
import { CSV_UPLOAD_CONFIG } from './constants.js';

// import external modules
import multer from 'multer';

// sub-function to validate file type
function filterCSVType(_, file, cb) {
  if (file.mimetype === CSV_UPLOAD_CONFIG.ALLOWED_MIME_TYPE) cb(null, true);
  else cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
}

// function to upload single/multiple CSV file
export const uploadCSVFiles = multer({
  fileFilter: filterCSVType,
  limits: { fileSize: CSV_UPLOAD_CONFIG.MAX_FILE_SIZE },
  storage: multer.memoryStorage(),
}).fields([
  {
    name: CSV_UPLOAD_CONFIG.FIELD_NAME,
    maxCount: CSV_UPLOAD_CONFIG.MAX_FILE_COUNT,
  },
]);
