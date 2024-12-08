// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");
const { newInventoryRules, checkUpdateData } = require("../utilities/inventory-validation");
const { requireEmployeeOrAdmin } = require("../utilities/auth-middleware");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetailByInventoryId));

// Route for inventory management view
router.get(
  "/",
  requireEmployeeOrAdmin, // Protects management view
  utilities.handleErrors(invController.managementView)
);

// Route to get a list of items in inventory based on the classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to add a classification
router.get(
  "/add-classification",
  requireEmployeeOrAdmin, // Protects add-classification view
  utilities.handleErrors(invController.addClassificationView)
);

// Route to validate classification data
router.post(
  "/add-classification",
  requireEmployeeOrAdmin, // Protects add-classification post route
  inventoryValidate.addClassificationRules(),
  inventoryValidate.checkAddClassification,
  utilities.handleErrors(invController.addClassification)
);

// Route to add inventory
router.get(
  "/add-inventory",
  requireEmployeeOrAdmin, // Protects add-inventory view
  utilities.handleErrors(invController.addInventoryView)
);

// Route to validate inventory data
router.post(
  "/add-inventory",
  requireEmployeeOrAdmin, // Protects add-inventory post route
  inventoryValidate.addInventoryRules(),
  inventoryValidate.checkAddInventory,
  utilities.handleErrors(invController.addInventory)
);

// Route to handle modifying an inventory item
router.get(
  "/edit/:inventoryId",
  requireEmployeeOrAdmin, // Protects edit-inventory view
  utilities.handleErrors(invController.editInventoryView)
);

// Route to validate updated information for an inventory item
router.post(
  "/update",
  requireEmployeeOrAdmin, // Protects update-inventory post route
  newInventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to display delete confirmation view
router.get(
  "/delete/:inventoryId",
  requireEmployeeOrAdmin, // Protects delete-confirmation view
  utilities.handleErrors(invController.deleteInventoryView)
);

// Route to handle delete process
router.post(
  "/delete",
  requireEmployeeOrAdmin, // Protects delete post route
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;