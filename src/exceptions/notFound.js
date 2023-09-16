const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class HTTP404Error extends BaseError {
    constructor (
        name,
        statusCode = httpStatusCodes.NOT_FOUND,
        description = 'NOT FOUND',
        isOperational = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

module.exports = HTTP404Error;