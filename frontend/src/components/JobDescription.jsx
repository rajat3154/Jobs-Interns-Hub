import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSingleJob } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const JobDescription = () => {
  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
 const apiUrl = import.meta.env.VITE_API_URL;
  console.log("📌 Job ID from URL:", jobId);
  console.log("👤 Logged-in user:", user);

  // Fetch job data
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        console.log("Fetching single job...");
        const res = await axios.get(`${apiUrl}/api/v1/job/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          console.log("Job fetched successfully:", res.data.job);
          dispatch(setSingleJob(res.data.job));
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job data.");
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch]);

  // Set application status when singleJob or user changes
  useEffect(() => {
    console.log("Evaluating application status...");
    console.log("Current singleJob in effect:", singleJob);
    console.log("Current user in effect:", user);

    if (singleJob?.applications && user?._id) {
      console.log("Applications array:", singleJob.applications);
      console.log("User ID:", user._id);
      const userApplication = singleJob.applications.find(
        (application) => application.applicant?._id === user._id
      );
      console.log("Found user application:", userApplication);
      setIsApplied(!!userApplication);
      if (userApplication) {
        setApplicationStatus(userApplication.status);
      } else {
        setApplicationStatus(null);
      }
      console.log("isApplied set to:", !!userApplication);
    } else {
      setIsApplied(false);
      setApplicationStatus(null);
      console.log("isApplied set to false (no job applications or user id).");
    }
  }, [singleJob, user]);

  // Handle Apply button click
  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs");
      return;
    }

    setIsApplying(true);
    console.log("Attempting to apply for job...");
    try {
      const res = await axios.post(
        `${apiUrl}/api/v1/application/apply/${jobId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        // Optimistically update UI state immediately
        setIsApplied(true);
        setApplicationStatus('pending');

        console.log("Application successful, refetching job for full consistency...");
        // Refetch job for full consistency with backend (includes updated applications array)
        const updatedJobRes = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (updatedJobRes.data.success) {
          console.log("Job refetched after apply:", updatedJobRes.data.job);
          dispatch(setSingleJob(updatedJobRes.data.job));
        }
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error.response?.data?.message || "Failed to apply for the job.");
    } finally {
      setIsApplying(false);
      console.log("Application process finished.");
    }
  };

  if (!singleJob) {
    return (
      <div className="text-white text-center mt-10">Loading job data...</div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-10 sm:py-20 overflow-x-hidden overflow-y-hidden">
      <div className="container px-2 sm:px-4 mx-auto">
        {/* Company Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={singleJob.created_by?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {singleJob.created_by?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="font-semibold text-2xl sm:text-3xl">
              {singleJob.created_by?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{singleJob.location}</p>
          </div>
        </div>

        {/* Job Title and Apply Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">{singleJob.title}</h1>
          {user?.role === "student" && (
            <Button
              onClick={applyJobHandler}
              disabled={isApplied || isApplying}
              className={`w-full sm:w-auto px-4 py-2 rounded-md font-bold transition-colors duration-300 ${
                isApplied || isApplying
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isApplied
                ? "Already Applied"
                : isApplying
                ? "Applying..."
                  : "Apply Now"}
            </Button>
          )}
        </div>

        {/* Job Info Badges */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold rounded-md">
            {singleJob.positions} Positions
          </span>
          <span className="px-3 py-1 bg-red-100 text-[#F83002] text-xs sm:text-sm font-bold rounded-md">
            {singleJob.jobType}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-[#7209b7] text-xs sm:text-sm font-bold rounded-md">
            {singleJob.salary}
          </span>
        </div>

        {/* Job Description */}
        <h2 className="border-b-2 border-gray-300 text-lg sm:text-xl font-medium py-3 sm:py-4 mb-4 sm:mb-6">
          Job Description
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <h1 className="font-bold text-base sm:text-lg">
            Role: <span className="font-normal text-gray-300">{singleJob.title}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Location: <span className="font-normal text-gray-300">{singleJob.location}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Description: <span className="font-normal text-gray-300">{singleJob.description}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Experience: <span className="font-normal text-gray-300">{singleJob.experience}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Salary: <span className="font-normal text-gray-300">{singleJob.salary}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Total Applicants: <span className="font-normal text-gray-300">{singleJob.applications?.length || 0}</span>
          </h1>
          <h1 className="font-bold text-base sm:text-lg">
            Posted Date: <span className="font-normal text-gray-300">{new Date(singleJob.createdAt).toLocaleDateString()}</span>
          </h1>

          {/* Skills Required Section */}
          {singleJob.requirements && singleJob.requirements.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {singleJob.requirements.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 text-blue-400 text-xs sm:text-sm rounded-md border border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescription;

