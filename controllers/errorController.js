const errorCont = {};

/* ***************************
 *  Generate Intentional Error
 * ************************** */
errorCont.generateError = (req, res, next) => {
  const err = new Error("This is an intentional 500-type server error.");
  err.status = 500; // Explicitly set the status to 500
  next(err); // Pass the error to the middleware
};

module.exports = errorCont;