import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LatestJobCards from "./LatestJobCards";
import { toast } from "sonner";
import { useSearch } from "../context/SearchContext";

const LatestJobs = () => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { searchQuery } = useSearch();
 const apiUrl = import.meta.env.VITE_API_URL;
  const fetchLatestJobs = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/job/latest`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log(data);
      if (data.success && Array.isArray(data.jobs)) {
        setLatestJobs(data.jobs);
        // Initialize saved status for each job
        const savedStatus = {};
        data.jobs.forEach(job => {
          savedStatus[job._id] = false;
        });
        setSavedJobs(savedStatus);
      }
    } catch (error) {
      console.error("Error fetching latest jobs:", error);
    }
  };

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  const filteredJobs = latestJobs.filter((job) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      (job.description && job.description.toLowerCase().includes(query)) ||
      (job.company?.name && job.company.name.toLowerCase().includes(query)) ||
      (job.company &&
        typeof job.company === "string" &&
        job.company.toLowerCase().includes(query)) ||
      (job.location && job.location.toLowerCase().includes(query)) ||
      (job.jobType && job.jobType.toLowerCase().includes(query)) ||
      (job.skills &&
        job.skills.some((skill) => skill.toLowerCase().includes(query)))
    );
  });

  const handleJobClick = (jobId) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    navigate(`/job/description/${jobId}`);
  };

  const handleSaveClick = async (jobId) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/job/save-job/${jobId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to save job");

      const data = await response.json();
      if (data.success) {
        setSavedJobs(prev => ({
          ...prev,
          [jobId]: !prev[jobId]
        }));
        toast.success(data.message || (savedJobs[jobId] ? "Job unsaved" : "Job saved"));
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };

  return (
    <div className="bg-black text-white py-10 sm:py-16">
      <div className="container mx-auto text-center px-2 sm:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-bold mb-6 sm:mb-10">
          <span className="text-blue-500 text-xl xs:text-2xl sm:text-3xl">Latest and Top </span>Job
          Openings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-0 sm:px-4">
          {filteredJobs.length <= 0 ? (
            <span className="col-span-full text-gray-400 text-base sm:text-lg">
              {searchQuery ? "No jobs match your search" : "No jobs available"}
            </span>
          ) : (
            filteredJobs.map((job) => (
              <LatestJobCards
                key={job._id}
                job={job}
                onDetails={() => handleJobClick(job._id)}
                onSave={() => handleSaveClick(job._id)}
                isSaved={savedJobs[job._id] || false}
              />
            ))
          )}

          <Link
            to="/jobs"
            className="w-full p-4 sm:p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-blue-400">View More Jobs</h2>
            <p className="mt-2 text-gray-300 text-base sm:text-lg">
              Explore all job openings
            </p>
            <div className="mt-4 sm:mt-6 flex justify-center">
              <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-blue-500 text-blue-400 text-xl sm:text-2xl cursor-pointer hover:text-white transition duration-300">
                ➡️
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestJobs;
