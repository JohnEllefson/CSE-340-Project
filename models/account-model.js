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

module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, 
                  updateAccount, updatePassword, getAccountById};