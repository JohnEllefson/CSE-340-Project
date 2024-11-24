const errorCont = {};

/* ***************************
 *  Generate Intentional Error
 * ************************** */
errorCont.generateError = (req, res, next) => {
  try {
    // Intentionally cause a runtime error
    null.toString();
  } catch (err) {
    // Catch and pass the error to the middleware
    next(err);
  }
};

module.exports = errorCont;