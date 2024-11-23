const invModel = require("../models/inventory-model")
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

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = ""; // Initialize grid to an empty string
  if (data.length > 0) {
      grid = '<ul id="inv-display">';
      data.forEach(vehicle => { 
          grid += '<li>';
          grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
          grid += '<div class="namePrice">';
          grid += '<hr />';
          grid += '<h2>';
          grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}</a>`;
          grid += '</h2>';
          grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
          grid += '</div>';
          grid += '</li>';
      });
      grid += '</ul>';
  } else { 
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'; // Correctly initialize grid
  }
  return grid;
};

/* ***************************
 *  Build Vehicle Detail View HTML
 * ************************** */
Util.buildVehicleDetailView = function (vehicleData) {
  const make = vehicleData.inv_make || "Unknown Make";
  const model = vehicleData.inv_model || "Unknown Model";
  const year = vehicleData.inv_year || "Unknown Year";
  const price = vehicleData.inv_price ? `$${new Intl.NumberFormat('en-US').format(vehicleData.inv_price)}` : "Price not available";
  const mileage = vehicleData.inv_miles ? `${new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)} miles` : "Mileage not available";
  const color = vehicleData.inv_color || "Color not available";
  const description = vehicleData.inv_description || "No description available.";
  const imageFull = vehicleData.inv_image || "/images/no-image.png"; // Default image

  return `
    <div class="vehicle-detail">
      <h1>${make} ${model}</h1>
      <div class="vehicle-detail-container">
        <img src="${imageFull}" alt="${make} ${model}" class="vehicle-image" />
        <div class="vehicle-info">
          <p><strong>Year:</strong> ${year}</p>
          <p><strong>Price:</strong> ${price}</p>
          <p><strong>Mileage:</strong> ${mileage}</p>
          <p><strong>Color:</strong> ${color}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
      </div>
    </div>
  `;
};

/*****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for 
 * General Error Handling
 *****************************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util;