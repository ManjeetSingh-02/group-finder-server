// import local modules
import { APIResponse } from '../../response.api.js';

// @controller GET /
export const healthCheck = (_, res) => {
  return res.status(200).json(new APIResponse(200, { message: 'Server is Running' }));
};
