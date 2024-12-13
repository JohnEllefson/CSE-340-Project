const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const utilities = require("../utilities/");

const invCont = {};

/******************************************
 *  Build inventory by classification view
 ******************************************/
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const accountId = res.locals.loggedin ? res.locals.accountData.account_id : null;

    // Fetch inventory data
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // If logged in, fetch favorites for the user
    let favorites = [];
    if (accountId) {
      favorites = await accountModel.getFavoritesByAccountId(accountId);
    }

    // Map over inventory data and determine if each vehicle is favorited
    const updatedData = data.map((vehicle) => {
      return {
        ...vehicle,
        isFavorited: favorites.some((fav) => fav.inv_id === vehicle.inv_id),
      };
    });

    console.log(updatedData);

    // Build the classification grid with updated data
    const grid = await utilities.buildClassificationGrid(updatedData, res.locals.loggedin);
    const nav = await utilities.getNav();

    // Render the classification page
    res.render("inventory/classification", {
      title: "Vehicle Classification",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building classification view:", error);
    next(error);
  }
};

/*******************************
 *  Build inventory detail view
 *******************************/
invCont.buildDetailByInventoryId = async function (req, res, next) {
  try {
    const invId = req.params.inventoryId;
    const vehicleData = await invModel.getInventoryById(invId);
    if (!vehicleData) {
      return res.status(404).send("Vehicle not found.");
    }

    let isFavorited;
    if (res.locals.loggedin) {
      isFavorited = await accountModel.isVehicleFavorited(res.locals.accountData.account_id, invId);
    }

    const detailViewHTML = await utilities.buildVehicleDetailView(vehicleData, isFavorited);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailViewHTML,
    });
  } catch (error) {
    console.error("Error building detail view:", error);
    next(error);
  }
};

/************************************
 *  Render Inventory Management View
 ************************************/
invCont.managementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId);

  if (isNaN(inv_id)) {
    return res.status(400).send("Invalid inventory ID");
  }

  try {
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      return res.status(404).send("Inventory item not found");
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/************************************
 *  Build delete inventory item view
 ************************************/
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId, 10);

  if (isNaN(inv_id)) {
    return res.status(400).send("Invalid inventory ID");
  }

  try {
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      return res.status(404).send("Inventory item not found");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    next(error);
  }
};

/*******************************
 *  Delete Inventory Item
 *******************************/
invCont.deleteInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    // Extract the inv_id from the request body
    const inv_id = parseInt(req.body.inv_id, 10);

    // Validate the inv_id
    if (isNaN(inv_id)) {
      req.flash("notice", "Invalid inventory ID. Please try again.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }

    // Call the model function to delete the inventory item
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed. Please try again.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;