const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/*****************************
 *   Check for existing email
 *****************************/
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Update account information
* ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `;

    if (!Number.isInteger(account_id)) {
      throw new Error("Invalid account_id: must be an integer");
    }
    if (!account_email || typeof account_email !== "string") {
      throw new Error("Invalid account_email: must be a string");
    }
    if (!account_firstname || typeof account_firstname !== "string") {
      throw new Error("Invalid account_firstname: must be a string");
    }
    if (!account_lastname || typeof account_lastname !== "string") {
      throw new Error("Invalid account_lastname: must be a string");
    }

    // Execute the query
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);

    return result.rows[0]; // Return the updated account data
  } catch (error) {
    console.error("Error updating account:", error.message);
    throw new Error("Error updating account");
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(account_password, account_id) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
    RETURNING *;
  `;
  return pool.query(sql, [account_password, account_id]);
}

/* ******************************
 *  Fetch account by ID
 * ***************************** */
async function getAccountById(accountId) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM account
      WHERE account_id = $1
    `;
    const result = await pool.query(sql, [accountId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching account by ID:", error.message);
    throw new Error("Error fetching account by ID");
  }
}

/* ******************************************
 *  Get all favorites for a given account_id
 * ******************************************/
async function getFavoritesByAccountId(accountId) {
  const sql = `
    SELECT f.favorite_id, f.account_id, f.inv_id, 
           i.inv_make, i.inv_model, i.inv_year, 
           i.inv_thumbnail, i.inv_price
    FROM favorites f
    JOIN inventory i ON f.inv_id = i.inv_id
    WHERE f.account_id = $1;
  `;

  try {
    const result = await pool.query(sql, [accountId]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    throw new Error("Error fetching favorites.");
  }
}

/* ******************************************
 *  Add a favorite for a given account_id
 * ******************************************/
async function addFavorite(accountId, invId) {
  const sql = `
    INSERT INTO favorites (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
  `;
  if (!accountId || !invId) {
    throw new Error("Account ID or Inventory ID is missing");
  }

  return await pool.query(sql, [accountId, invId]);
}


/* ******************************************
 *  Remove a favorite for a given account_id
 * ******************************************/
async function removeFavorite(accountId, invId) {
  const sql = `
    DELETE FROM favorites
    WHERE account_id = $1 AND inv_id = $2;
  `;
  if (!accountId || !invId) {
    throw new Error("Account ID or Inventory ID is missing  ");
  }

  return await pool.query(sql, [accountId, invId]);
};

/* ******************************************
 *  Remove a favorite for a given account_id
 * ******************************************/
async function isVehicleFavorited(accountId, invId) {
  const sql = `
    SELECT COUNT(*) 
    FROM favorites 
    WHERE account_id = $1 AND inv_id = $2;
  `;
  const result = await pool.query(sql, [accountId, invId]);
  return parseInt(result.rows[0].count, 10) > 0;
}

module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, 
                  updateAccount, updatePassword, getAccountById, getFavoritesByAccountId,
                  addFavorite, removeFavorite, isVehicleFavorited};