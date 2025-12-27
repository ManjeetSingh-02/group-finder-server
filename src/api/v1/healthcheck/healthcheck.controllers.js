// import local modules
import { APISuccessResponse } from '../../response.api.js';

// @controller GET /
export const healthCheck = (_, res) => {
  return res.status(200).json(new APISuccessResponse(200, { message: 'Server is Running' }));
};
