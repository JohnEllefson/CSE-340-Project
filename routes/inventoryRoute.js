// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetailByInventoryId));

// Route for inventory management view
router.get("/", utilities.handleErrors(invController.managementView));

// Route to add a classification
router.get("/add-classification", utilities.handleErrors(invController.addClassificationView));

// Route to validate classification data
router.post(
  "/add-classification",
  inventoryValidate.addClassificationRules(),
  inventoryValidate.checkAddClassification,
  utilities.handleErrors(invController.addClassification)
);

// Route to add inventory
router.get("/add-inventory", utilities.handleErrors(invController.addInventoryView));

// Route to validate inventory data
router.post(
  "/add-inventory",
  inventoryValidate.addInventoryRules(),
  inventoryValidate.checkAddInventory,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;