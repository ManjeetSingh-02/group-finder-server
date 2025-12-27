// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIError } from '../../error.api.js';
import { APIResponse } from '../../response.api.js';
import { Cohort } from '../../../models/index.js';
import { CSV_UPLOAD_CONFIG } from '../../../utils/constants.js';

// import external modules
import { Readable } from 'stream';
import csvParser from 'csv-parser';

// @controller POST /
export const createCohort = asyncHandler(async (req, res) => {
  // check if cohort with the same name already exists
  const existingCohort = await Cohort.findOne({ cohortName: req.body.cohortName })
    .select('_id')
    .lean();
  if (existingCohort)
    throw new APIError(409, {
      type: 'Create Cohort Error',
      message: 'Cohort with the same name already exists',
    });

  // create new cohort in db
  const newCohort = await Cohort.create({
    cohortName: req.body.cohortName,
    cohortDescription: req.body.cohortDescription,
    createdBy: req.user.id,
  });
  if (!newCohort)
    throw new APIError(500, {
      type: 'Create Cohort Error',
      message: 'Something went wrong while creating the cohort',
    });

  // send success status to user
  return res.status(201).json(
    new APIResponse(201, {
      message: 'Cohort created successfully',
      data: { newCohortName: newCohort.cohortName },
    })
  );
});

// @controller GET /
export const getAllCohorts = asyncHandler(async (_, res) => {
  // fetch all cohorts from db
  const allCohorts = await Cohort.find()
    .select('cohortName cohortDescription createdBy')
    .populate('createdBy', '_id username')
    .lean();

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'All Cohorts fetched successfully',
      data: allCohorts,
    })
  );
});

// @controller GET /:cohortName
export const getCohortDetails = asyncHandler(async (req, res) => {
  // fetch cohort from db
  const existingCohort = await Cohort.findById(req.cohort.id)
    .select('_id cohortName cohortDescription createdBy')
    .populate('createdBy', '_id username')
    .populate({
      path: 'associatedGroups',
      select:
        '_id groupName createdBy groupMembersCount maximumMembersCount roleRequirements -associatedCohort',
      populate: {
        path: 'createdBy',
        select: '_id username',
      },
    })
    .lean();
  if (!existingCohort)
    throw new APIError(404, {
      type: 'Cohort Fetch Error',
      message: 'Cohort not found',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Cohort details fetched successfully',
      data: existingCohort,
    })
  );
});

// @controller PATCH /:cohortName/process-csv
export const processCSVandAddUsersToCohort = asyncHandler(async (req, res) => {
  // fetch cohort from db
  const existingCohort = await Cohort.findById(req.cohort.id).select('allowedUserEmails');

  // parse all uploaded CSV files
  const allParsedFileResults = await Promise.all(
    req.files[CSV_UPLOAD_CONFIG.FIELD_NAME].map(file => parseCSVFile(file.buffer))
  );

  // create a email set to track duplicates
  const emailSet = new Set(existingCohort.allowedUserEmails);

  // extract user emails from parsed results and add to email set
  allParsedFileResults.forEach(parsedFileResult => {
    parsedFileResult.forEach(row => {
      if (row.email) emailSet.add(row.email.toLowerCase().trim());
    });
  });

  // convert email set back to array
  existingCohort.allowedUserEmails = Array.from(emailSet);

  // save updated cohort to db
  await existingCohort.save({ validateBeforeSave: false });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'CSV processed and userEmails added to cohort successfully',
    })
  );
});

// @controller PATCH /:cohortName/add-user
export const addUserToCohort = asyncHandler(async (req, res) => {
  // add user email to cohort using $addToSet to avoid duplicates
  const updatedCohort = await Cohort.updateOne(
    { _id: req.cohort.id },
    { $addToSet: { allowedUserEmails: req.body.userEmail } }
  );

  // check if cohort was updated
  if (updatedCohort.modifiedCount === 0)
    throw new APIError(409, {
      type: 'Add User Error',
      message: 'User email already exists in cohort',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'User email added to cohort successfully',
    })
  );
});

// @controller PATCH /:cohortName/remove-user
export const removeUserFromCohort = asyncHandler(async (req, res) => {
  // remove user email from cohort using $pull
  const updatedCohort = await Cohort.updateOne(
    { _id: req.cohort.id },
    { $pull: { allowedUserEmails: req.body.userEmail } }
  );

  // check if cohort was updated
  if (updatedCohort.modifiedCount === 0)
    throw new APIError(404, {
      type: 'Remove User Error',
      message: 'User email not found in cohort',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'User email removed from cohort successfully',
    })
  );
});

// @controller PATCH /:cohortName/description
export const updateCohortDescription = asyncHandler(async (req, res) => {
  // update cohort description in db
  const updatedCohort = await Cohort.updateOne(
    { _id: req.cohort.id },
    { cohortDescription: req.body.cohortDescription }
  );

  // check if cohort was updated
  if (updatedCohort.modifiedCount === 0)
    throw new APIError(409, {
      type: 'Update Cohort Description Error',
      message: 'Something went wrong while updating the cohort description',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Cohort description updated successfully',
    })
  );
});

// sub-function to parse one CSV file buffer
async function parseCSVFile(fileBuffer) {
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
