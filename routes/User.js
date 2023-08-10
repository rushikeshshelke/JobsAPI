const express = require("express");
const validators = require("express-validator");

const { signup, login } = require("../controllers/User");

const router = express.Router();

router.post(
  "/signup",
  [
    validators
      .check("name")
      .not()
      .isEmpty()
      .withMessage("'name'' field can not be left blank!"),
    validators
      .check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email!"),
    validators
      .check("password")
      .isLength({ min: 8 })
      .withMessage("Please enter password with minimun 8 characters long!"),
  ],
  signup
);
router.post(
  "/login",
  [
    validators
      .check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email!"),
    validators
      .check("password")
      .not()
      .isEmpty()
      .withMessage("'password' field can not be left blank!"),
  ],
  login
);

module.exports = router;
