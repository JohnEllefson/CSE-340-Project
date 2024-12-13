// Needed Resources 
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Deliver Account Management View
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.attachAccountData,
  utilities.handleErrors(accountController.buildAccountManagementView)
);

// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to logout the user
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

// Route to deliver the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Update Account Information Route
router.get(
  "/update/:id",
  utilities.checkLogin,
  utilities.attachAccountData,
  utilities.handleErrors(accountController.getUpdateAccountView)
);

// Process Account Update Form
router.post(
  "/update",
  regValidate.newAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.processUpdateAccount)
);

// Process Update Password Form
router.post(
  "/update-password",
  regValidate.passwordValidationRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.processUpdatePassword)
);

// Process the Favorites page
router.get(
  "/favorites",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildFavoritesPage)
);

// Add a favorite
router.post(
  "/favorites/:invId", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.addFavorite)
);

// Remove a favorite
router.delete(
  "/favorites/:invId", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.deleteFavorite)
);

module.exports = router;