// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIError } from '../../error.api.js';
import { APIResponse } from '../../response.api.js';
import { Cohort } from '../../../models/index.js';

// @controller POST /
export const createCohort = asyncHandler(async (req, res) => {
  // get data from request body
  const { cohortName, cohortDescription } = req.body;

  // check if cohort with the same name already exists
  const existingCohort = await Cohort.findOne({ cohortName });
  if (existingCohort)
    throw new APIError(409, {
      type: 'Create Cohort Error',
      message: 'Cohort with the same name already exists',
    });

  // create new cohort in db
  const newCohort = await Cohort.create({
    cohortName,
    cohortDescription,
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
      data: newCohort,
    })
  );
});
