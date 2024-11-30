const pool = require("../database/")
const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/*****************************
 *  Get vehicle details by ID
 *****************************/
invModel.getInventoryById = async function (inventoryId) {
  try {
    const db = require("../database/index"); // Assuming a db module exists for database queries
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await db.query(sql, [inventoryId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    throw error;
  }
}

/*************************
 *  Insert classification
 *************************/
invModel.addClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting classification:", error.message);
    throw error;
  }
};

/****************************
 * Add New Inventory Item
 ****************************/
invModel.addInventory = async function (inventoryData) {
  try {
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
    } = inventoryData;

    const sql = `
      INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_year, inv_price, inv_description, inv_image, inv_thumbnail, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await pool.query(sql, [
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
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Error adding inventory:", error.message);
    throw error;
  }
};

module.exports = invModel;