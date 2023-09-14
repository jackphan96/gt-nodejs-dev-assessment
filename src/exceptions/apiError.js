const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class HTTP500Error extends BaseError {
    constructor(
        name, 
        statusCode = httpStatusCodes.INTERNAL_SERVER, 
        description = 'INTERNAL SERVER ERROR',
        isOperational = true
    ) {
      super(name, statusCode, isOperational, description);
    }
}

module.exports = HTTP500Error;