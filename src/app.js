const express = require("express");
const app = express ();
app.use(express.json());

/* ROUTES */
app.use('/',  require('./routes/health'));
app.use('/api', require('./routes/apiRoute'));

app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    // Send an error response to the client
    res.status(500).json({ error: 'Internal Server Error' });
  });

module.exports = app;