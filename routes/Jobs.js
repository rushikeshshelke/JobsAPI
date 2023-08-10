const express = require("express");
const validator = require("express-validator");

const AuthMiddleware = require("../middlewares/Auth");

const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/Jobs");

const router = express.Router();

router.get("/", getAllJobs);
router.post(
  "/",
  AuthMiddleware,
  [
    validator
      .check("company")
      .not()
      .isEmpty()
      .withMessage("'company can not left blank!"),
    validator
      .check("position")
      .not()
      .isEmpty()
      .withMessage("'position' can not be left blank!"),
  ],
  createJob
);
router.get("/:jobId", getJobById);
router.patch(
  "/:jobId",
  AuthMiddleware,
  [
    validator
      .check("status")
      .not()
      .isEmpty()
      .withMessage("'status' field can not be left blank!"),
  ],
  updateJob
);
router.delete("/:jobId", AuthMiddleware, deleteJob);

module.exports = router;
