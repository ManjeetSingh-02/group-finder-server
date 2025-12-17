// import local modules
import { CSV_UPLOAD_CONFIG } from './constants.js';

// import external modules
import multer from 'multer';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

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

// function to parse one CSV file buffer
export async function parseCSVFile(fileBuffer) {
  // array to hold parsed data
  const parsedDataArray = [];

  // return a promise that resolves with parsed data or rejects with an error
  return new Promise((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
          mapValues: ({ value }) => value.trim(),
        })
      )
      .on('data', parseData => parsedDataArray.push(parseData))
      .on('error', parseError => reject(parseError))
      .on('end', () => resolve(parsedDataArray));
  });
}
