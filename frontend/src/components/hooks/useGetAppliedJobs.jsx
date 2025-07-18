import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { APPLICATION_API_END_POINT } from "@/utils/constant";

const useGetAppliedJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
 const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!user?._id) return;

    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/api/v1/application/get`,{
          withCredentials:true
        });
        setAppliedJobs(data?.appliedJobs || []);
      } catch (err) {
        console.error("Failed to fetch applied jobs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  return { appliedJobs, loading };
};

export default useGetAppliedJobs;
