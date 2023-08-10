require("dotenv").config();
const HttpError = require("./HttpError");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const auth = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer")) {
    return next(
      new HttpError(
        "Authentication failed. Invalid Bearer token. Please provide valid one!",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  try {
    const decodedToken = jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET_KEY
    );
    req.user = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(
      new HttpError(`Authentication failed : ${err}`, StatusCodes.UNAUTHORIZED)
    );
  }
};

module.exports = auth;
