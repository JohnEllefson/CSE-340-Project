const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
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

/* ***************************
 *  Build inventory detail view
 * ************************** */
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

module.exports = invCont;