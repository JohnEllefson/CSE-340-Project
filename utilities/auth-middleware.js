const jwt = require("jsonwebtoken");

function requireEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "You must log in to access this feature.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if account_type is either 'Employee' or 'Admin'
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      next();
    } else {
      req.flash("notice", "Unauthorized access.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    req.flash("notice", "You must log in to access this feature.");
    res.redirect("/account/login");
  }
}

module.exports = { requireEmployeeOrAdmin };