import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LatestInternshipCards from "./LatestInternshipCards";
import { toast } from "sonner";
import { useSearch } from "../context/SearchContext";

const LatestInternships = () => {
  const [latestInternships, setLatestInternships] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { searchQuery } = useSearch();
 const apiUrl = import.meta.env.VITE_API_URL;
  const fetchLatestInternships = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/internship/latest`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.success && Array.isArray(data.internships)) {
        setLatestInternships(data.internships);
      }
    } catch (error) {
      console.error("Error fetching latest internships:", error);
    }
  };

  useEffect(() => {
    fetchLatestInternships();
  }, []);

  const filteredInternships = latestInternships.filter((internship) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      internship.title.toLowerCase().includes(query) ||
      (internship.description &&
        internship.description.toLowerCase().includes(query)) ||
      (internship.recruiter?.companyname &&
        internship.recruiter.companyname.toLowerCase().includes(query)) ||
      (internship.location &&
        internship.location.toLowerCase().includes(query)) ||
      (internship.type && internship.type.toLowerCase().includes(query)) ||
      (internship.skills &&
        internship.skills.some((skill) => skill.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="bg-black text-white py-10 sm:py-16">
      <div className="container mx-auto text-center px-2 sm:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-bold mb-6 sm:mb-10">
          <span className="text-blue-500 text-xl xs:text-2xl sm:text-3xl">Latest and Top </span>
          Internships
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mx-0 sm:mx-4">
          {filteredInternships.length <= 0 ? (
            <span className="col-span-full text-gray-400 text-base sm:text-lg">
              {searchQuery
                ? "No internships match your search"
                : "No internships available"}
            </span>
          ) : (
            filteredInternships.map((internship) => (
              <LatestInternshipCards
                key={internship._id}
                internship={internship}
              />
            ))
          )}

          <Link
            to="/internships"
            className="w-full p-4 sm:p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-blue-400">
              View More Internships
            </h2>
            <p className="mt-2 text-gray-300 text-base sm:text-lg">
              Explore all internship opportunities
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

export default LatestInternships;
