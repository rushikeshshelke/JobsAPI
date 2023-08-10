require("dotenv").config();
const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const HttpError = "../middlewares/HttpError";

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: uuid.v4, identifier: true },
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre("save", async function (next) {
  try {
    let salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(this.password);
  } catch (err) {
    return next(
      HttpError(
        `Something went wrong... Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  next();
});

UserSchema.methods.createJWTToken = function () {
  let token;
  token = jwt.sign(
    { userId: this._id, name: this.name, email: this.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );

  return token;
};

UserSchema.methods.comparePassword = async function (originalPassword) {
  let isMatched;
  isMatched = await bcrypt.compare(originalPassword, this.password);
  return isMatched;
};

module.exports = mongoose.model("User", UserSchema);
