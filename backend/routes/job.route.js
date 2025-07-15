import express from "express"; 
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { deleteJobById, getAllJobs, getJobById, getLatestJobs, getRecruiterJobs, isJobSaved, postJob, saveJob } from "../controllers/job.controller.js";
import { Job } from "../models/job.model.js";
import { Student } from "../models/student.model.js";

const router = express.Router();
router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/recruiter").get(isAuthenticated, getRecruiterJobs);
router.route("/recruiter/:id").get(isAuthenticated, async (req, res) => {
    try {
        const jobs = await Job.find({ created_by: req.params.id })
            .populate({
                path: 'created_by',
                select: 'companyname profile',
                populate: {
                    path: 'profile',
                    select: 'profilePhoto bio'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error("Error fetching recruiter jobs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recruiter jobs"
        });
    }
});
router.route("/latest").get(getLatestJobs); 
router.route("/is-saved/:id").get(isAuthenticated, isJobSaved);
router.route("/save-job/:id").post(isAuthenticated, saveJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJobById);

// Get all saved jobs for a student
router.route("/saved").get(isAuthenticated, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get all saved jobs with populated recruiter information
    const savedJobs = await Job.find({ _id: { $in: student.savedJobs } })
      .populate({
        path: 'created_by',
        select: 'companyname profile',
        populate: {
          path: 'profile',
          select: 'profilePhoto bio'
        }
      })
      .sort({ createdAt: -1 });

    console.log("Saved jobs with populated recruiter:", JSON.stringify(savedJobs, null, 2));

    res.status(200).json({
      success: true,
      savedJobs
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs"
    });
  }
});

export default router;