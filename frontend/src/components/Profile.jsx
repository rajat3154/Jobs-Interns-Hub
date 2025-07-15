import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Contact,
  Mail,
  Pen,
  MessageSquare,
  Loader2,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Users,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Badge } from "./ui/badge";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import LatestJobCards from "./LatestJobCards";
import LatestInternshipCards from "./LatestInternshipCards";
import { formatDistanceToNow } from 'date-fns';
import FollowButton from "./FollowButton";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Profile = () => {
  const [open, setOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [savedInternshipsLoading, setSavedInternshipsLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const { user: currentUser } = useSelector((store) => store.auth);
  const { userId, userType } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        let endpoint;

        if (userId && userType) {
          endpoint = `http://localhost:8000/api/v1/${userType.toLowerCase()}/${userId}`;
        } else if (currentUser?._id) {
          endpoint = `http://localhost:8000/api/v1/${currentUser.role.toLowerCase()}/${
            currentUser._id
          }`;
        } else {
          toast.error("No user ID available");
          setLoading(false);
          return;
        }

        const response = await axios.get(endpoint, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setProfileUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId || currentUser?._id) {
      fetchUserProfile();
    }
  }, [userId, userType, currentUser?._id, navigate]);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!profileUser?._id) return;

      try {
        setFollowersLoading(true);
        setFollowingLoading(true);

        const [followersRes, followingRes] = await Promise.all([
          axios.get(
            `http://localhost:8000/api/v1/follow/followers/${profileUser._id}/${profileUser.role}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
          axios.get(
            `http://localhost:8000/api/v1/follow/following/${profileUser._id}/${profileUser.role}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
        ]);

        setFollowers(followersRes.data.data);
        setFollowing(followingRes.data.data);
      } catch (error) {
        console.error("Error fetching follow data:", error);
        toast.error("Failed to load connections");
      } finally {
        setFollowersLoading(false);
        setFollowingLoading(false);
      }
    };

    fetchFollowData();
  }, [profileUser]);

  const fetchAppliedJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/application/get",
        {
          withCredentials: true,
        }
      );
      console.log("Applied Jobs Response:", response.data);

      if (response.data.success) {
        setAppliedJobs(response.data.appliedJobs);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error.response || error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchAppliedInternships = async () => {
    try {
      setInternshipsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/application/internships/get",
        { withCredentials: true }
      );
      

      if (response.data.success) {
        setAppliedInternships(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applied internships:", error);
      toast.error("Failed to load applied internships");
    } finally {
      setInternshipsLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      setSavedJobsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/job/saved",
        {
          withCredentials: true,
        }
      );
      console.log("Saved jobs : ",response);
      if (response.data.success) {
        setSavedJobs(response.data.savedJobs);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const fetchSavedInternships = async () => {
    try {
      setSavedInternshipsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/internship/saved",
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setSavedInternships(response.data.savedInternships);
      }
    } catch (error) {
      console.error("Error fetching saved internships:", error);
      toast.error("Failed to load saved internships");
    } finally {
      setSavedInternshipsLoading(false);
    }
  };

  // Add a function to check if viewing own profile
  const isOwnProfile = () => {
    if (userId && userType) {
      return currentUser?._id === userId && currentUser?.role.toLowerCase() === userType.toLowerCase();
    }
    return true; // If no userId/userType in params, it's the current user's profile
  };

  useEffect(() => {
    if (currentUser?._id && currentUser?.role === "student" && isOwnProfile()) {
      fetchAppliedJobs();
      fetchAppliedInternships();
      fetchSavedJobs();
      fetchSavedInternships();
    } else if (currentUser?._id && currentUser?.role === "student") {
      // If viewing someone else's profile, only fetch applied jobs/internships
      fetchAppliedJobs();
      fetchAppliedInternships();
    }
  }, [currentUser, userId, userType]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const followersButton = document.getElementById("followers-button");
      const followingButton = document.getElementById("following-button");
      const followersPopup = document.getElementById("followers-popup");
      const followingPopup = document.getElementById("following-popup");

      if (
        followersOpen &&
        !followersButton?.contains(event.target) &&
        !followersPopup?.contains(event.target)
      ) {
        setFollowersOpen(false);
      }

      if (
        followingOpen &&
        !followingButton?.contains(event.target) &&
        !followingPopup?.contains(event.target)
      ) {
        setFollowingOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [followersOpen, followingOpen]);

  const handleMessageClick = () => {
    if (!currentUser) {
      toast.error("Please login to message");
      return;
    }

    const selectedUser = {
      _id: profileUser._id,
      fullName: profileUser.fullname || profileUser.companyname,
      email: profileUser.email,
      role: profileUser.role.toLowerCase(),
      profilePhoto: profileUser.profile?.profilePhoto,
      identifier:
        profileUser.role === "STUDENT"
          ? "Student"
          : profileUser.companyname || "Recruiter",
      isOnline: false,
    };

    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    navigate("/messages");
  };

  const handleFollowCountChange = (isFollowing) => {
    setFollowers((prevFollowers) => {
      if (isFollowing) {
        return [
          ...prevFollowers,
          {
            _id: currentUser._id,
            fullname: currentUser.fullname || currentUser.companyname,
            role: currentUser.role,
            profile: { profilePhoto: currentUser.profile?.profilePhoto },
          },
        ];
      } else {
        return prevFollowers.filter(
          (follower) => follower._id !== currentUser._id
        );
      }
    });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser?._id && !userId) {
      navigate("/login");
    }
  }, [loading, currentUser, userId, navigate]);

  const handleSaveClick = async (itemId, type) => {
    if (!currentUser) {
      toast.error("Please login to save items");
      return;
    }

    try {
      const endpoint = type === 'job' 
        ? `http://localhost:8000/api/v1/job/save-job/${itemId}`
        : `http://localhost:8000/api/v1/internship/save-internship/${itemId}`;

      const response = await axios.post(endpoint, {}, { withCredentials: true });

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh the saved items
        if (type === 'job') {
          fetchSavedJobs();
        } else {
          fetchSavedInternships();
        }
      }
    } catch (error) {
      console.error(`Error ${type === 'job' ? 'saving job' : 'saving internship'}:`, error);
      toast.error(`Failed to ${type === 'job' ? 'save job' : 'save internship'}`);
    }
  };

  // Add this useEffect after the other useEffects
  useEffect(() => {
    if (currentUser?.role === "student") {
      fetchSavedJobs();
      fetchSavedInternships();
    }
  }, [currentUser]);

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Never';
    return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
  };

  const handleViewPdf = (url) => {
    if (!url) {
      toast.error("No resume available");
      return;
    }

    // Use Google Docs Viewer
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    setPdfUrl(googleDocsUrl);
    setShowPdf(true);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setPageNumber(1);
    setPdfLoading(false);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading document:", error);
    setPdfError("Failed to load PDF. Please try again.");
    setPdfLoading(false);
    toast.error("Failed to load PDF. Please try again.");
  };

  const handleClosePdf = () => {
    setShowPdf(false);
    setPdfUrl("");
    setNumPages(null);
    setPageNumber(1);
    setPdfLoading(false);
    setPdfError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  const isStudent = profileUser?.role?.toUpperCase() === "STUDENT";

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            {/* Left side: Avatar + Text Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-blue-500">
                <AvatarImage
                  src={profileUser?.profile?.profilePhoto}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl bg-gray-800 text-blue-400">
                  {(profileUser?.fullname || profileUser?.companyname)?.charAt(
                    0
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profileUser.role === "student"
                    ? profileUser.fullname
                    : profileUser.companyname}
                </h1>
                <p className="text-gray-600 mt-1">
                  {profileUser.role === "student"
                    ? profileUser.branch
                    : profileUser.company}
                </p>
                <p className="text-gray-300 mt-2">
                  {profileUser?.profile?.headline ||
                    (isStudent ? "Student" : "Recruiter")}
                </p>
              </div>
            </div>

            {/* Right side: Buttons (only if not own profile) */}
            {!isOwnProfile() && (
              <div className="flex gap-3">
                <FollowButton
                  userId={profileUser._id}
                  userType={profileUser.role}
                  className="w-32"
                  size="default"
                />
                <Button
                  variant="outline"
                  size="default"
                  className="w-32 text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300"
                  onClick={handleMessageClick}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
            {/* Edit Profile Button for own profile */}
            {isOwnProfile() && (
              <Button
                onClick={() => setOpen(true)}
                className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Pen className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">About</h2>
            <p className="text-gray-300">
              {profileUser?.profile?.bio || "No bio provided yet."}
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="text-blue-400 h-5 w-5" />
              <span>{profileUser?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Contact className="text-blue-400 h-5 w-5" />
              <span>
                {profileUser?.phonenumber ||
                  profileUser?.phoneNumber ||
                  "Not provided"}
              </span>
            </div>
            {profileUser?.profile?.website && (
              <div className="flex items-center gap-3 text-gray-300">
                <LinkIcon className="text-blue-400 h-5 w-5" />
                <a
                  href={profileUser.profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 hover:underline"
                >
                  {profileUser.profile.website}
                </a>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
              {isStudent ? (
                <>
                  <GraduationCap className="h-5 w-5" />
                  Skills & Education
                </>
              ) : (
                <>
                  <Briefcase className="h-5 w-5" />
                  Company Details
                </>
              )}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profileUser?.profile?.skills?.length > 0 ? (
                profileUser.profile.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No skills added</span>
              )}
            </div>
          </div>

          {/* Resume */}
          {isStudent && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-blue-400 mb-2">
                Resume
              </h2>
              {profileUser?.profile?.resume ? (
                <Button
                  onClick={() =>
                    handleViewPdf(profileUser.profile.resume)
                  }
                  variant="ghost"
                  className="inline-flex items-center gap-2 text-blue-400 hover:underline px-0"
                >
                  <LinkIcon className="h-5 w-5" />
                  {profileUser.profile.resumeOriginalName || "View Resume"}
                </Button>
              ) : (
                <span className="text-gray-500">No resume uploaded</span>
              )}
            </div>
          )}

          {/* Followers/Following */}
          <div className="flex items-center gap-4 mt-6">
            <div className="relative">
              <Button
                id="followers-button"
                variant="ghost"
                className="text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => {
                  setFollowersOpen(!followersOpen);
                  setFollowingOpen(false);
                }}
              >
                <Users className="h-5 w-5 mr-2" />
                {followersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{followers.length} Followers</span>
                )}
              </Button>
              {followersOpen && (
                <div
                  id="followers-popup"
                  className="absolute top-full left-0 mt-2 w-72 bg-black border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-blue-400 mb-3">
                      Followers
                    </h3>
                    <ScrollArea className="h-64 pr-3">
                      {followersLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : followers.length > 0 ? (
                        <div className="space-y-3">
                          {followers.map((follower) => (
                            <div
                              key={follower._id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                              onClick={() => {
                                navigate(
                                  `/profile/${follower.role.toLowerCase()}/${
                                    follower._id
                                  }`
                                );
                                setFollowersOpen(false);
                              }}
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={follower.profile?.profilePhoto}
                                />
                                <AvatarFallback className="bg-gray-700 text-blue-400">
                                  {(
                                    follower.fullname || follower.companyname
                                  )?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                  {follower.fullname || follower.companyname}
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                  {follower.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-6">
                          No followers yet
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                id="following-button"
                variant="ghost"
                className="text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => {
                  setFollowingOpen(!followingOpen);
                  setFollowersOpen(false);
                }}
              >
                <Users className="h-5 w-5 mr-2" />
                {followingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{following.length} Following</span>
                )}
              </Button>
              {followingOpen && (
                <div
                  id="following-popup"
                  className="absolute top-full left-0 mt-2 w-72 bg-black border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-blue-400 mb-3">
                      Following
                    </h3>
                    <ScrollArea className="h-64 pr-3">
                      {followingLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : following.length > 0 ? (
                        <div className="space-y-3">
                          {following.map((followed) => (
                            <div
                              key={followed._id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                              onClick={() => {
                                navigate(
                                  `/profile/${followed.role.toLowerCase()}/${
                                    followed._id
                                  }`
                                );
                                setFollowingOpen(false);
                              }}
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={followed.profile?.profilePhoto}
                                />
                                <AvatarFallback className="bg-gray-700 text-blue-400">
                                  {(
                                    followed.fullname || followed.companyname
                                  )?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                  {followed.fullname || followed.companyname}
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                  {followed.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-6">
                          Not following anyone yet
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applied Jobs and Internships - Only for student's own profile */}
        {isOwnProfile() && isStudent && (
          <div className="bg-gray-950 rounded-xl shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-blue-400 mb-6">
              Applications
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Applied Jobs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Applied Jobs
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
                    {jobsLoading ? "..." : appliedJobs.length}
                  </Badge>
                </div>

                {jobsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : appliedJobs.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-700">
                    <Table className="min-w-full">
                      <TableHeader className="bg-gray-800">
                        <TableRow>
                          <TableHead className="text-gray-300">Date</TableHead>
                          <TableHead className="text-gray-300">
                            Position
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Company
                          </TableHead>
                          <TableHead className="text-right text-gray-300">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appliedJobs.map((app) => (
                          <TableRow
                            key={app._id}
                            className="border-gray-700 hover:bg-gray-800/50 transition-colors"
                          >
                            <TableCell className="text-gray-300">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {app.job?.title}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {app.job?.created_by?.companyname}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={`
                                  ${
                                    app.status === "rejected"
                                      ? "bg-red-500/20 text-red-400"
                                      : app.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                  } 
                                  px-3 py-1
                                `}
                              >
                                {app.status.charAt(0).toUpperCase() +
                                  app.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                    <p className="text-gray-400">
                      You haven't applied to any jobs yet
                    </p>
                  </div>
                )}
              </div>

              {/* Applied Internships */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Applied Internships
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
                    {internshipsLoading ? "..." : appliedInternships.length}
                  </Badge>
                </div>

                {internshipsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : appliedInternships.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-700">
                    <Table className="min-w-full">
                      <TableHeader className="bg-gray-800">
                        <TableRow>
                          <TableHead className="text-gray-300">Date</TableHead>
                          <TableHead className="text-gray-300">
                            Position
                          </TableHead>
                          <TableHead className="text-gray-300">
                            Company
                          </TableHead>
                          <TableHead className="text-right text-gray-300">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appliedInternships.map((app) => (
                          <TableRow
                            key={app._id}
                            className="border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/internship/details/${app.internship?._id}`
                              )
                            }
                          >
                            <TableCell className="text-gray-300">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {app.internship?.title}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {app.internship?.recruiter?.companyname}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={`
                                  ${
                                    app.status === "rejected"
                                      ? "bg-red-500/20 text-red-400"
                                      : app.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                  } 
                                  px-3 py-1
                                `}
                              >
                                {app.status.charAt(0).toUpperCase() +
                                  app.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                    <p className="text-gray-400">
                      You haven't applied to any internships yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Only show Saved Items section for own profile */}
        {isOwnProfile() && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              Saved Items
            </h2>
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-950 p-1 mb-8 w-full">
                <TabsTrigger
                  value="jobs"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-400"
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  Saved Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="internships"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-400"
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  Saved Internships
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs">
                {savedJobsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : savedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {savedJobs.map((job) => (
                      <div
                        key={job._id}
                        className="relative p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300"
                      >
                        <div className="absolute top-3 right-4 flex gap-2">
                          <Button
                            onClick={() =>
                              navigate(`/job/description/${job._id}`)
                            }
                            variant="outline"
                            className="px-3 py-1 bg-purple-500 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleSaveClick(job._id, "job")}
                            variant="outline"
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-md flex items-center gap-2"
                          >
                            <BookmarkCheck size={16} />
                            Saved
                          </Button>
                        </div>

                        <div className="mt-12">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-400">
                              {new Date(job.createdAt).toDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mb-6">
                            <img
                              src={
                                job.created_by?.profile?.profilePhoto ||
                                "https://via.placeholder.com/50"
                              }
                              alt="Company Logo"
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/50";
                              }}
                            />
                            <div>
                              <h1 className="font-semibold text-lg">
                                {job.created_by?.companyname}
                              </h1>
                              <p className="text-sm text-gray-400">
                                {job.location}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h1 className="font-bold text-xl mb-3">
                              {job.title}
                            </h1>
                            <p className="text-sm text-gray-300 line-clamp-3">
                              {job.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-blue-400 text-black text-sm font-bold rounded-md">
                              {job.position} Positions
                            </span>
                            <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                              {job.jobType}
                            </span>
                            <span className="px-2 py-1 bg-yellow-400 text-black text-sm font-bold rounded-md">
                              {job.salary}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No saved jobs yet
                  </div>
                )}
              </TabsContent>

              <TabsContent value="internships">
                {savedInternshipsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : savedInternships.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {savedInternships.map((internship) => (
                      <div
                        key={internship._id}
                        className="relative p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300"
                      >
                        <div className="absolute top-3 right-4 flex gap-2">
                          <Button
                            onClick={() =>
                              navigate(
                                `/internship/description/${internship._id}`
                              )
                            }
                            variant="outline"
                            className="px-3 py-1 bg-purple-500 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() =>
                              handleSaveClick(internship._id, "internship")
                            }
                            variant="outline"
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-md flex items-center gap-2"
                          >
                            <BookmarkCheck size={16} />
                            Saved
                          </Button>
                        </div>

                        <div className="mt-12">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-400">
                              {new Date(internship.createdAt).toDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mb-6">
                            <img
                              src={
                                internship.recruiter?.profile?.profilePhoto ||
                                "https://via.placeholder.com/50"
                              }
                              alt="Company Logo"
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h1 className="font-semibold text-lg">
                                {internship.recruiter?.companyname}
                              </h1>
                              <p className="text-sm text-gray-400">
                                {internship.location}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h1 className="font-bold text-xl mb-3">
                              {internship.title}
                            </h1>
                            <p className="text-sm text-gray-300 line-clamp-3">
                              {internship.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-blue-400 text-black text-sm font-bold rounded-md">
                              {internship.duration}
                            </span>
                            <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                              {internship.type}
                            </span>
                            <span className="px-2 py-1 bg-yellow-400 text-black text-sm font-bold rounded-md">
                              {internship.stipend}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No saved internships yet
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Update Dialog */}
      <UpdateProfileDialog open={open} setOpen={setOpen} />

      {showPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Resume Preview</h3>
              <Button onClick={handleClosePdf} variant="ghost" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
