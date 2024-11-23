const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities/");

router.get("/trigger-error", utilities.handleErrors(errorController.generateError));

module.exports = router;