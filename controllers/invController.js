const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/******************************************
 *  Build inventory by classification view
 ******************************************/
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    res.render("inventory/classification", {
      title: "Vehicle Classification",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/*******************************
 *  Build inventory detail view
 *******************************/
invCont.buildDetailByInventoryId = async function (req, res, next) {
  try {
    const inventoryId = req.params.inventoryId;
    const vehicleData = await invModel.getInventoryById(inventoryId);
    if (!vehicleData) {
      return res.status(404).send("Vehicle not found.");
    }
    const detailViewHTML = await utilities.buildVehicleDetailView(vehicleData);
    const nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailViewHTML,
    });
  } catch (error) {
    next(error);
  }
};

/************************************
 *  Render Inventory Management View
 ************************************/
invCont.managementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
};

/***************************
 *  Add Classification View
 ***************************/
invCont.addClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

/******************************************
 *  Add New Classification to the Database
 ******************************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const insertResult = await invModel.addClassification(classification_name);

    if (insertResult) {
      req.flash("notice", `The classification "${classification_name}" was successfully added.`);
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add classification.");
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        messages: req.flash("notice"),
        errors: null,
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**********************
 *  Add Inventory View
 **********************/
invCont.addInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationDropdown = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationDropdown,
      messages: req.flash("notice"),
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

/*********************************
 *  Add Inventory to the Database
 *********************************/
invCont.addInventory = async function (req, res, next) {
  try {
    // Extract and sanitize input values
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_color,
    } = req.body;

    // Convert empty strings to null for numerical fields
    const sanitizedData = {
      classification_id: classification_id || null,
      inv_make: inv_make.trim(),
      inv_model: inv_model.trim(),
      inv_year: inv_year ? parseInt(inv_year, 10) : null,
      inv_price: inv_price ? parseFloat(inv_price) : null,
      inv_description: inv_description.trim(),
      inv_image: inv_image.trim(),
      inv_thumbnail: inv_thumbnail.trim(),
      inv_miles: inv_miles ? parseInt(inv_miles, 10) : null,
      inv_color: inv_color.trim(),
    };

    // Pass sanitized data to the model
    const insertResult = await invModel.addInventory(sanitizedData);

    if (insertResult) {
      req.flash("notice", `The inventory item "${sanitizedData.inv_make} ${sanitizedData.inv_model}" was successfully added.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add inventory item.");
      res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        nav: await utilities.getNav(),
        classificationDropdown: await utilities.buildClassificationList(),
        messages: req.flash("notice"),
        errors: null,
        ...req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;