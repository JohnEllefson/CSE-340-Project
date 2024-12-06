const { body, validationResult } = require("express-validator");
const utilities = require("./");
const invModel = require("../models/inventory-model");
const inventoryValidate = {};

/*************************************
 *  Add Classification Validation Rules
 **************************************/
inventoryValidate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isAlphanumeric()
      .withMessage("Classification name must be alphanumeric without spaces or special characters."),
  ];
};

/*****************************************************************
 * Check data and return errors or continue to add classification
 *****************************************************************/
inventoryValidate.checkAddClassification = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      classification_name,
    });
    return;
  }
  next();
};

/**********************************
 *  Add Inventory Validation Rules
 **********************************/
inventoryValidate.addInventoryRules = () => {
  return [
    body("inv_make").trim().matches(/^[a-zA-Z0-9 ]+$/).withMessage("Make is required and must be alphanumeric and can contain spaces."),
    body("inv_model").trim().matches(/^[a-zA-Z0-9 ]+$/).withMessage("Model is required and must be alphanumeric and can contain spaces."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid number between 1900 and 2100."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").isString().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").isString().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

/*****************************************************************
 * Check data and return errors or continue to add inventory item
 *****************************************************************/
inventoryValidate.checkAddInventory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationDropdown = await utilities.buildClassificationList(req.body.classification_id);
    res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationDropdown,
      messages: req.flash("notice"),
      errors: errors.array(),
      ...req.body,
    });
    return;
  }
  next();
};

/**********************************
 *  Update Inventory Validation Rules
 **********************************/
inventoryValidate.newInventoryRules = () => {
  return [
    body("inv_make").trim().matches(/^[a-zA-Z0-9 ]+$/).withMessage("Make is required and must be alphanumeric and can contain spaces."),
    body("inv_model").trim().matches(/^[a-zA-Z0-9 ]+$/).withMessage("Model is required and must be alphanumeric and can contain spaces."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid number between 1900 and 2100."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").isString().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").isString().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

/*****************************************************************
 * Check data and return errors or continue to update inventory item
 *****************************************************************/
inventoryValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationDropdown = await utilities.buildClassificationList(req.body.classification_id);
    const { inv_id } = req.body;
    res.status(400).render("inventory/edit-inventory", {
      title: "Edit Inventory Item",
      nav,
      classificationDropdown,
      messages: req.flash("notice"),
      errors: errors.array(),
      ...req.body,
      inv_id,
    });
    return;
  }
  next();
};

module.exports = inventoryValidate;