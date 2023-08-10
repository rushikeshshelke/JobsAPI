const { StatusCodes } = require("http-status-codes");
const validators = require("express-validator");
const bcrypt = require("bcryptjs");

const HttpError = require("../middlewares/HttpError");
const User = require("../models/User");

const signup = async (req, res, next) => {
  const errors = validators.validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.formatWith((error) => error.msg).array(),
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  console.log(req.body);
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, Could not create user! Please try again : ${err}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return next(error);
  }

  if (existingUser) {
    return next(
      new HttpError(
        "User already exists! Try login instead.",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const createdUser = new User({
    name,
    email,
    password,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, Could able to sign in you, Please try again ${err}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return next(error);
  }

  let token;
  try {
    token = createdUser.createJWTToken();
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong... Please try again! ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (token.startsWith("Something went wrong...")) {
    return next(new HttpError(token, StatusCodes.INTERNAL_SERVER_ERROR));
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      token: token,
    },
  });
};

const login = async (req, res, next) => {
  const errors = validators.validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.formatWith((error) => error.msg).array(),
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  console.log(req.body);
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, Could not logged you in. Try Again! : ${err}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return next(error);
  }

  if (!existingUser) {
    return next(
      new HttpError(
        "User does not exists, Try signing in instead!",
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  let isMatched;
  try {
    isMatched = await existingUser.comparePassword(password);
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Invalid credentials : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!isMatched) {
    return next(
      new HttpError(
        "Invalid credentials... Could not logged you in!",
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  let token;
  try {
    token = existingUser.createJWTToken();
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong... Please try again! ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (token.startsWith("Something went wrong...")) {
    return next(new HttpError(token, StatusCodes.INTERNAL_SERVER_ERROR));
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Successfully logged you in...",
    token: token,
  });
};

module.exports = { signup, login };
