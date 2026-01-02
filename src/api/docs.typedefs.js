/**
 * Standard structure for success details in API responses.
 * @typedef {object} SuccessData
 * @property {string} message - Success message (Always present)
 * @property {object} [data] - The data returned (Optional payload)
 */

/**
 * Standard structure for successful API responses.
 * @typedef {object} APISuccessResponse
 * @property {boolean} success - Indicates the request was successful
 * @property {number} statusCode - The HTTP status code
 * @property {SuccessData} response - The container for the message and data
 */

/**
 * Standard structure for error details in API responses.
 * @typedef {object} ErrorData
 * @property {string} type - The category of error
 * @property {string} message - A human-readable description
 * @property {string[]} [issues] - List of specific issues (Optional)
 */

/**
 * Standard structure for all error API responses.
 * @typedef {object} APIErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {number} statusCode - The HTTP status code
 * @property {ErrorData} error - The container for error details
 *
 */