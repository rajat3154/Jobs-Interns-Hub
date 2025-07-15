import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Check, X, Search, User, Briefcase, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "./shared/Navbar";

const Admin = () => {
  const [students, setStudents] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [recruiterRequests, setRecruiterRequests] = useState([]);
  const [loading, setLoading] = useState({
    students: true,
    recruiters: true,
    requests: true,
  });
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Pagination state
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentRecruiterPage, setCurrentRecruiterPage] = useState(1);
  const itemsPerPage = 5;

  // Search state
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [recruiterSearchTerm, setRecruiterSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recruiter requests
        const requestsRes = await fetch(`${apiUrl}/api/v1/admin/recruiter-requests`, {
          credentials: "include",
        });
        const requestsData = await requestsRes.json();
        if (requestsData.success) {
          setRecruiterRequests(requestsData.requests);
        }

        // Fetch recruiters
        const recruitersRes = await fetch(`${apiUrl}/api/v1/recruiter/recruiters`, {
          credentials: "include",
        });
        const recruitersData = await recruitersRes.json();
        if (recruitersData.success) {
          setRecruiters(recruitersData.recruiters);
        }

        // Fetch students
        const studentsRes = await fetch(`${apiUrl}/api/v1/student/students`, {
          credentials: "include",
        });
        const studentsData = await studentsRes.json();
        if (studentsData.success) {
          setStudents(studentsData.students);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading({ students: false, recruiters: false, requests: false });
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filter and pagination logic
  const filteredStudents = students.filter(
    (student) =>
      student.fullname?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (student.profile?.skills || []).some((skill) =>
        skill.toLowerCase().includes(studentSearchTerm.toLowerCase())
      )
  );

  const filteredRecruiters = recruiters.filter(
    (recruiter) =>
      recruiter.companyname?.toLowerCase().includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.email?.toLowerCase().includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.cinnumber?.toLowerCase().includes(recruiterSearchTerm.toLowerCase())
  );

  // Pagination calculations
  const paginate = (items, currentPage) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentItems: items.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(items.length / itemsPerPage),
    };
  };

  const {
    currentItems: currentStudents,
    totalPages: totalStudentPages,
  } = paginate(filteredStudents, currentStudentPage);

  const {
    currentItems: currentRecruiters,
    totalPages: totalRecruiterPages,
  } = paginate(filteredRecruiters, currentRecruiterPage);

  // Action handlers
  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/recruiter-requests/${id}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));
      setRecruiters((prev) => [...prev, data.recruiter]);
      toast.success("Recruiter approved successfully");
    } catch (error) {
      console.error("Error approving recruiter:", error);
      toast.error(error.message || "Failed to approve recruiter");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/recruiter-requests/${id}/reject`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to reject recruiter");

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Recruiter request rejected");
    } catch (error) {
      console.error("Error rejecting recruiter:", error);
      toast.error(error.message || "Failed to reject recruiter");
    }
  };

  const handleDeleteUser = async (id, type) => {
    const confirmMessage = `Are you sure you want to delete this ${type}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/${type}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (type === "student") {
        setStudents((prev) => prev.filter((s) => s._id !== id));
      } else {
        setRecruiters((prev) => prev.filter((r) => r._id !== id));
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error.message || `Failed to delete ${type}`);
    }
  };

  // Helper functions
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading skeleton
  const LoadingSkeleton = ({ rows = 5 }) => (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Students: {students.length}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Recruiters: {recruiters.length}
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              Pending: {recruiterRequests.length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <User size={16} /> Students
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="flex items-center gap-2">
              <Briefcase size={16} /> Recruiters
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock size={16} /> Requests
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl">Student Management</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      className="pl-10 bg-gray-900 border-gray-700"
                      value={studentSearchTerm}
                      onChange={(e) => {
                        setStudentSearchTerm(e.target.value);
                        setCurrentStudentPage(1);
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.students ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-900">
                          <TableRow>
                            <TableHead className="w-[100px]">Profile</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Skills</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentStudents.length > 0 ? (
                            currentStudents.map((student) => (
                              <TableRow key={student._id} className="hover:bg-gray-900/50">
                                <TableCell>
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={student.profile?.profilePhoto} />
                                    <AvatarFallback>
                                      {getInitials(student.fullname)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {student.fullname}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(student.profile?.skills || []).slice(0, 3).map((skill) => (
                                      <Badge key={skill} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {(student.profile?.skills || []).length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{(student.profile?.skills || []).length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{formatDate(student.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(student._id, "student")}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                {students.length === 0
                                  ? "No students found"
                                  : "No matching students found"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {totalStudentPages > 1 && (
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentStudentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentStudentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentStudentPage} of {totalStudentPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentStudentPage((prev) => Math.min(prev + 1, totalStudentPages))
                          }
                          disabled={currentStudentPage === totalStudentPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruiters Tab */}
          <TabsContent value="recruiters">
            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl">Recruiter Management</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search recruiters..."
                      className="pl-10 bg-gray-900 border-gray-700"
                      value={recruiterSearchTerm}
                      onChange={(e) => {
                        setRecruiterSearchTerm(e.target.value);
                        setCurrentRecruiterPage(1);
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.recruiters ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-900">
                          <TableRow>
                            <TableHead className="w-[100px]">Logo</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>CIN</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRecruiters.length > 0 ? (
                            currentRecruiters.map((recruiter) => (
                              <TableRow key={recruiter._id} className="hover:bg-gray-900/50">
                                <TableCell>
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={recruiter.profile?.profilePhoto} />
                                    <AvatarFallback>
                                      {getInitials(recruiter.companyname)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {recruiter.companyname}
                                </TableCell>
                                <TableCell>{recruiter.email}</TableCell>
                                <TableCell>{recruiter.cinnumber}</TableCell>
                                <TableCell>{formatDate(recruiter.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(recruiter._id, "recruiter")}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                {recruiters.length === 0
                                  ? "No recruiters found"
                                  : "No matching recruiters found"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {totalRecruiterPages > 1 && (
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentRecruiterPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentRecruiterPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentRecruiterPage} of {totalRecruiterPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentRecruiterPage((prev) => Math.min(prev + 1, totalRecruiterPages))
                          }
                          disabled={currentRecruiterPage === totalRecruiterPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-gray-800 bg-black">
              <CardHeader>
                <CardTitle className="text-xl">Recruiter Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.requests ? (
                  <LoadingSkeleton rows={3} />
                ) : recruiterRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recruiterRequests.map((req) => (
                      <div
                        key={req._id}
                        className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border border-gray-700">
                            <AvatarImage src={req.profile?.profilePhoto} />
                            <AvatarFallback>
                              {getInitials(req.companyname)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 grid gap-1">
                            <h3 className="font-semibold text-lg">{req.companyname}</h3>
                            <p className="text-sm text-gray-400">{req.email}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-gray-500">CIN Number</p>
                                <p className="text-sm">{req.cinnumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm">{req.companyaddress}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(req._id)}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check size={16} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(req._id)}
                              className="gap-1"
                            >
                              <X size={16} /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">
                      No pending requests
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      All recruiter requests have been processed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;