const mongoose = require("mongoose");
const uuid = require("uuid");

const JobSchema = mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuid.v4, identifier: true },
    company: { type: String, required: true, maxLength: 50 },
    position: { type: String, required: true, maxLength: 100 },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
