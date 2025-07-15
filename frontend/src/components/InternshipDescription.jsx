import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";

const InternshipDescription = () => {
  const { id } = useParams();
  const { user } = useSelector((store) => store.auth);
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const fetchInternshipDetails = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/internship/get/${id}`,
        { withCredentials: true }
      );
      console.log(data);
      setInternship(data.internship);

      // If current user has applied, get their application status
      if (data.currentUserApplication) {
        setHasApplied(true);
        setApplicationStatus(data.currentUserApplication.status || "Pending");
      } else {
        setHasApplied(false);
        setApplicationStatus(null);
      }
    } catch (error) {
      console.error("Failed to fetch internship details:", error);
      toast.error("Failed to load internship details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternshipDetails();
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    try {
      setApplying(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/application/apply/intern/${id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Applied successfully!");
        setHasApplied(true);
        setApplicationStatus("Pending");
      } else {
        toast.error(res.data.message || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while applying.");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return <div className="text-white text-center mt-20">Loading...</div>;
  if (!internship)
    return (
      <div className="text-white text-center mt-20">Internship not found.</div>
    );

  return (
    <div className="bg-black text-white min-h-screen py-20 overflow-x-hidden">
      <div className="container px-4 ml-8 mr-10">
        {/* Company Info */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={internship.created_by?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {internship.created_by?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-3xl">
              {internship.created_by?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{internship.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 mr-7">
          <h1 className="text-2xl font-bold">{internship.title}</h1>
          {user?.role !== "recruiter" && (
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`px-4 py-2 rounded-md font-bold transition-colors duration-300 ${
                hasApplied || applying
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {hasApplied
                ? "Already Applied"
                : applying
                ? "Applying..."
                : "Apply Now"}
            </button>
          )}
        </div>

        {/* Internship details */}
        <div className="flex gap-4 mb-6">
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-md">
            {internship.duration}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-md">
            ₹{internship.stipend}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-md">
            {internship.type}
          </span>
        </div>

        <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
          Internship Details
        </h2>
        <div className="space-y-4 mb-12">
          <p>
            <strong>Role:</strong>{" "}
            <span className="text-gray-300">{internship.title}</span>
          </p>
          <p>
            <strong>Location:</strong>{" "}
            <span className="text-gray-300">{internship.location}</span>
          </p>
          <p>
            <strong>Description:</strong>{" "}
            <span className="text-gray-300">{internship.description}</span>
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            <span className="text-gray-300">{internship.duration}</span>
          </p>
          <p>
            <strong>Stipend:</strong>{" "}
            <span className="text-gray-300">₹{internship.stipend}/month</span>
          </p>
          <p>
            <strong>Type:</strong>{" "}
            <span className="text-gray-300">{internship.type}</span>
          </p>
          <p>
            <strong>Required Skills:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {internship.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </p>
          <p>
            <strong>Posted Date:</strong>{" "}
            <span className="text-gray-300">
              {new Date(internship.createdAt).toDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternshipDescription;
