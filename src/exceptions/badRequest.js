const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class HTTP400Error extends BaseError {
    constructor (
        name,
        statusCode = httpStatusCodes.BAD_REQUEST,
        description = 'NOT FOUND',
        isOperational = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

module.exports = HTTP400Error;