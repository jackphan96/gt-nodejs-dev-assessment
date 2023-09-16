const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class HTTP409Error extends BaseError {
    constructor (
        name,
        statusCode = httpStatusCodes.CONFLICT,
        description = 'CONFLICT ERROR',
        isOperational = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

module.exports = HTTP409Error;