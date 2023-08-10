const validator = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const HttpError = require("../middlewares/HttpError");
const Job = require("../models/Jobs");

const getAllJobs = async (req, res, next) => {
  let jobs;
  try {
    jobs = await Job.find({}, "-__v -createdBy").sort("-createdAt");
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to fetch jobs, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res.status(StatusCodes.OK).json({ success: true, jobs: jobs });
};

const getJobById = async (req, res, next) => {
  const jobId = req.params.jobId;
  let job;
  try {
    job = await Job.findById(jobId, "-__v -createdBy");
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to fetch job, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!job) {
    return next(new HttpError(`Job does not exists!`, StatusCodes.BAD_REQUEST));
  }
  res.status(StatusCodes.OK).json({ success: true, job: job });
};

const createJob = async (req, res, next) => {
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.formatWith((error) => error.msg).array(),
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  console.log(req.body);
  console.log(req.user);

  const { company, position, status } = req.body;
  const userId = req.user.userId;

  const createdJob = new Job({
    company,
    position,
    status,
    createdBy: userId,
  });

  try {
    await createdJob.save();
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not create job, Please try again ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.CREATED).json({ success: true, job: createdJob });
};

const updateJob = async (req, res, next) => {
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.formatWith((error) => error.msg).array(),
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }

  const jobId = req.params.jobId;
  const status = req.body.status;
  let job;
  try {
    job = await Job.findById(jobId, "-__v");
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to fetch job, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!job) {
    return next(new HttpError(`Job does not exists!`, StatusCodes.BAD_REQUEST));
  }

  if (job.createdBy !== req.user.userId) {
    return next(
      new HttpError(
        `You don't have access to update the job status!`,
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  job.status = status;
  try {
    await job.save();
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to update job status, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.OK).json({ success: true, job: job });
};

const deleteJob = async (req, res, next) => {
  const jobId = req.params.jobId;

  let job;
  try {
    job = await Job.findById(jobId, "-__v");
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to fetch job, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!job) {
    return next(new HttpError(`Job does not exists!`, StatusCodes.BAD_REQUEST));
  }

  if (job.createdBy !== req.user.userId) {
    return next(
      new HttpError(
        `You don't have access to delete this job!`,
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  try {
    await job.deleteOne({ _id: jobId });
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, Could not able to delete job, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res.status(StatusCodes.NO_CONTENT).json();
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob };
