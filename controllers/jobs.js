const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  // As we only the jobs, which are created by that particular user.

  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`No Job with the id ${jobId}`);
  } else {
    res.status(StatusCodes.OK).json({ job });
  }
};

const createJob = async (req, res) => {
  // Here, we are getting or merging two models to get CreatedBy data with id from the User model.
  // As we only the jobs, which are created by that particular user.
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("Company or position feilds cannot be empty");
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

   if (!job) {
     throw new NotFoundError(`No Job with the id ${jobId}`);
   } else {
     res.status(StatusCodes.OK).json({ job });
   }
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findByIdAndRemove({
    _id: jobId, 
    createdBy: userId
  })

  if (!job) {
    throw new NotFoundError(`No Job with the id ${jobId}`);
  } else {
    res.status(StatusCodes.OK).send("Job successfully deleted!");
  }
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
