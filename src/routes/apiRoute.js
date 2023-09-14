const express = require('express')
const router = express.Router();
const controller = require('../controllers/apiController')


/* METHODS */
router.post('/register', controller.register);
router.get('/commonstudents', controller.commonstudents);
router.post('/suspend', controller.suspend);
router.post('/retrievefornotifications', controller.retrievefornotifications);


module.exports = router;