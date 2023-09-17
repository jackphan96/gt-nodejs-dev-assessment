const express = require("express");
const app = express ();
app.use(express.json());

/* ROUTES */
app.use('/',  require('./routes/health'));
app.use('/api', require('./routes/apiRoute'));


// Error handling Middleware - Error message logger
const errorLogger = (error, request, response, next) => {
    console.log( `Error logger: ${error.message}`) 
    next(error) // calling next middleware
};

// Error handling Middleware 
const errorHandler = (error, req, res, next) => {
    console.error(`errorHandler: An error occurred:${error}`);
    // Send an error response to the client
    res.status(error?.statusCode || 500)
    .send({Error: error?.name || error });
};


// Fallback Middleware function for returning 
// 404 error for undefined paths
const invalidPathHandler = (request, response, next) => {
    response.status(404).send({message: `Invalid Path ${request.originalUrl}`});
}

app.use(errorLogger);
app.use(errorHandler);
app.use(invalidPathHandler);

module.exports = app;