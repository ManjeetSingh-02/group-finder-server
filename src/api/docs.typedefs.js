/**
 * Standard structure for success details in API responses.
 * @typedef {object} SuccessData
 * @property {string} message.required - Descriptive success message
 * @property {object | Array<object>} data - Actual data returned from the API
 */

/**
 * Standard structure for success API responses.
 * @typedef {object} APISuccessResponse
 * @property {boolean} success.required - Always true for success responses
 * @property {number} statusCode.required - HTTP status code
 * @property {SuccessData} response.required - Container for success response details
 */

/**
 * Standard structure for error details in API responses.
 * @typedef {object} ErrorData
 * @property {string} type.required - Category of error
 * @property {string} message.required - Descriptive error message
 * @property {Array<string>} issues - List of specific issues encountered
 */

/**
 * Standard structure for all error API responses.
 * @typedef {object} APIErrorResponse
 * @property {boolean} success.required - Always false for error responses
 * @property {number} statusCode.required - HTTP status code
 * @property {ErrorData} error.required - Container for error response details
 *
 */
