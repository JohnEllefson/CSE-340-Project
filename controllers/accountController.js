const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    // Add a test flash message
    req.flash("notice", "Welcome! Please log in to your account.");
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    firstName: req.body?.firstName || '',
    lastName: req.body?.lastName || '',
    email: req.body?.email || '',
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null, // Pass null to avoid undefined errors
      account_email: "", // Clear the email field
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Invalid email or password. Please try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const clientName = accountData.account_firstname
      const account_type = accountData.account_type
      const accessToken = jwt.sign(
        { clientName, account_type, ...accountData }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 }
      )
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Invalid password. Please try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagementView(req, res) {
  try {
    const nav = await utilities.getNav();
    const { account_type = "Client", account_firstname = "User" } = req.accountData || {};
    const messages = req.flash("notice");

    const inventoryManagement =
      account_type === "Employee" || account_type === "Admin"
        ? { showInventoryManagement: true, inventoryLink: "/inv/" }
        : { showInventoryManagement: false };

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      messages,
      errors: null,
      accountData: req.accountData || null,
      inventoryManagement,
    });
  } catch (error) {
    console.error("Error rendering Account Management View:", error.message);
    throw new Error("Error rendering Account Management View");
  }
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.accountData || {};

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    messages: req.flash("notice"),
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  });
}

/* ****************************************
 *  Process Update Account Form
 * ************************************ */
async function processUpdateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email } = req.body;
    const account_id = parseInt(req.body.account_id, 10);

    if (isNaN(account_id)) {
      throw new Error("Invalid account_id: must be an integer");
    }

    // Update the account in the database
    const result = await accountModel.updateAccount( 
      account_firstname, 
      account_lastname, 
      account_email,
      account_id
    );

    if (result) {
      // Confirm the update by fetching the account data
      const updatedAccount = await accountModel.getAccountById(account_id);

      // Update res.locals.clientName for header
      res.locals.clientName = updatedAccount.account_firstname;

      // Deliver management view with success message
      req.flash(
        "notice",
        `Account successfully updated for ${account_firstname} ${account_lastname}.`
      );
      let nav = await utilities.getNav();
      res.render("account/account-management", {
        title: "Account Management",
        nav,
        accountData: updatedAccount,
        messages: req.flash("notice"),
      });
    } else {
        req.flash("notice", "Database update failed. Please try again.");
        return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error("Error processing account update:", error.message);
    req.flash("error", "Unable to update account at this time.");
    next(error);
  }
}

/* ****************************************
 *  Process Update Password Form
 * ************************************ */
async function processUpdatePassword(req, res) {
  const { account_password, account_id } = req.body;

  // Validate and hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Password update failed. Please try again.");
    return buildUpdateAccountView(req, res);
  }

  const passwordResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (passwordResult) {
    // Deliver management view with success message
    req.flash("notice", "Password updated successfully.");

    // Confirm the password update by fetching the account data
    const accountData = await accountModel.getAccountById(account_id);

    // Update the account management view
    let nav = await utilities.getNav();
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      accountData,
      messages: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Password update failed. Please try again.");
    return buildUpdateAccountView(req, res);
  }
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function getUpdateAccountView(req, res, next) {
  const account_id = parseInt(req.params.id, 10);
  if (!account_id) {
    req.flash("error", "Invalid account ID.");
    return res.status(404).render("error", { title: "Error 404", message: "Invalid account ID." });
  }

  try {
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      return res.status(404).render("error", { title: "Error 404", message: "Account not found." });
    }
    let nav = await utilities.getNav();
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      messages: req.flash("notice"),
      formErrors: [],
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } catch (error) {
    console.error("Error fetching account data:", error.message);
    res.status(500).render("error", {
      title: "Server Error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

/* *************************
 *  Deliver Favorites View
 * *************************/
async function buildFavoritesPage(req, res, next) {
  try {
    const accountId = res.locals.accountData.account_id;
    const favorites = await accountModel.getFavoritesByAccountId(accountId);
    const messages = [];
    if (favorites.length === 0) {
      messages.push("No vehicles currently favorited.");
    }
    
    // Build the favorites grid
    const grid = await utilities.buildFavoritesGrid(favorites, res.locals.loggedin);
    const nav = await utilities.getNav();

    // Render the favorites page
    res.render("account/favorites", {
      title: "My Favorites",
      nav: nav,
      grid,
      messages: messages,
    });
  } catch (error) {
    console.error("Error building favorites page:", error);
    next(error);
  }
}

/* *************************
 *  Add a Favorite
 * *************************/
async function addFavorite(req, res, next) {
  try {
    const accountId = res.locals.accountData.account_id;
    const invId = parseInt(req.body.invId, 10);
    if (isNaN(invId)) {
      throw new Error("Invalid invId received");
    }

    console.log("Received invId in addFavorite:", req.body.invId);

    if (!accountId || !invId) {
      throw new Error("Account ID or Inventory ID is missing");
    }
    await accountModel.addFavorite(accountId, invId); 
    res.status(200).json({ success: true, message: "Vehicle added to favorites." });

  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ success: false, message: "Failed to add favorite." });
  }
}

/* *************************
 *  Remove a Favorite
 * *************************/
async function deleteFavorite(req, res, next) {
  try {
    const accountId = res.locals.accountData.account_id;
    const invId = parseInt(req.body.invId, 10);
    if (isNaN(invId)) {
      throw new Error("Invalid invId received");
    }

    console.log("Received invId in deleteFavorite:", req.body.invId);

    if (!accountId || !invId) {
      throw new Error("Account ID or Inventory ID is missing");
    }
    await accountModel.removeFavorite(accountId, invId);
    res.status(200).json({ success: true, message: "Vehicle removed from favorites." });

  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ success: false, message: "Failed to remove favorite." });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, 
                   buildAccountManagementView, buildUpdateAccountView, processUpdateAccount, processUpdatePassword, getUpdateAccountView, buildFavoritesPage,
                   addFavorite, deleteFavorite };