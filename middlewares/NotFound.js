const HttpError = require("./HttpError");
const { StatusCodes } = require("http-status-codes");

const notFound = (req, res, next) => {
  return next(
    new HttpError("Could not found this route!", StatusCodes.BAD_REQUEST)
  );
};

module.exports = notFound;
