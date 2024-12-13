const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
};

/* *************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data, loggedIn) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h3>';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}</a>`;
      grid += '</h3>';
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '<div class="favorite-icon">';
      grid += loggedIn ?
        vehicle.isFavorited
        ? `<img src="/images/site/heart_solid.png" alt="Remove from favorites" class="heart-icon" data-id="${vehicle.inv_id}" />`
        : `<img src="/images/site/heart_border.png" alt="Add to favorites" class="heart-icon" data-id="${vehicle.inv_id}" />` : "";
      grid += '</div>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ***************************
 *  Build Vehicle Detail View HTML
 * ************************** */
Util.buildVehicleDetailView = function (vehicleData, isFavorited) {
  const make = vehicleData.inv_make || "Unknown Make";
  const model = vehicleData.inv_model || "Unknown Model";
  const year = vehicleData.inv_year || "Unknown Year";
  const price = vehicleData.inv_price ? `$${new Intl.NumberFormat('en-US').format(vehicleData.inv_price)}` : "Price not available";
  const mileage = vehicleData.inv_miles ? `${new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)} miles` : "Mileage not available";
  const color = vehicleData.inv_color || "Color not available";
  const description = vehicleData.inv_description || "No description available.";
  const imageFull = vehicleData.inv_image || "/images/no-image.png"; // Default image

  // Determine button text and class based on favorited status
  const buttonText = isFavorited ? "Favorited!" : "Not Favorited";
  const buttonClass = isFavorited ? "favorite-button favorited" : "favorite-button not-favorited";

  return `
    <div class="vehicle-detail">
      <h2 id="detailsHeading">${make} ${model}</h2>
      <div class="vehicle-detail-container">
        <img src="${imageFull}" alt="${make} ${model}" class="vehicle-image" />
        <div class="vehicle-info">
          <p><strong>Year:</strong> ${year}</p>
          <p><strong>Price:</strong> ${price}</p>
          <p><strong>Mileage:</strong> ${mileage}</p>
          <p><strong>Color:</strong> ${color}</p>
          <p><strong>Description:</strong> ${description}</p>
          ${
            isFavorited !== undefined
              ? `<button class="${buttonClass}" id="favorite-button" data-id="${vehicleData.inv_id}">${buttonText}</button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
};

/*****************************************
 * Build the classification dropdown list
 *****************************************/
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";

    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id && row.classification_id == classification_id) {
        classificationList += " selected";
      }
      classificationList += `>${row.classification_name}</option>`;
    });

    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error.message);
    throw error;
  }
};

/*****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for 
 * General Error Handling
 *****************************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "You must be logged in to access this page.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Ensure account data is attached to the request
 * ************************************ */
 Util.attachAccountData = (req, res, next) => {
   const token = req.cookies.jwt;
   if (!token) {
     req.accountData = null;
     return next();
   }
 
   try {
     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     req.accountData = {
       account_id: decoded.account_id,
       account_firstname: decoded.clientName,
       account_type: decoded.account_type,
     };
     next();
   } catch (error) {
     console.error("Error decoding token in attachAccountData:", error.message);
     req.accountData = null;
     next();
   }
 }

/*******************************
 * Build the favorite view HTML
 *******************************/
Util.buildFavoritesGrid = async function (data, loggedIn) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h3>';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}</a>`;
      grid += '</h3>';
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '<div class="favorite-icon">';
      grid += `<img src="/images/site/heart_solid.png" alt="Remove from favorites" class="heart-icon" data-id="${vehicle.inv_id}" />`;
      grid += '</div>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

module.exports = Util;