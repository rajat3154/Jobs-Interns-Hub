import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Check,
  X,
  Search,
  Users,
  Briefcase,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Fetch recruiter requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/v1/admin/recruiter-requests`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRecruiterRequests(data.requests);
        }
      } catch (error) {
        console.error("Failed to fetch recruiter requests:", error);
        toast.error("Failed to load recruiter requests");
      } finally {
        setLoading((prev) => ({ ...prev, requests: false }));
      }
    };
    fetchRequests();
  }, []);

  // Fetch recruiters
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/recruiter/recruiters`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch recruiters");
        }

        if (data.success && Array.isArray(data.recruiters)) {
          setRecruiters(data.recruiters);
        }
      } catch (error) {
        console.error("Error fetching recruiters:", error);
        toast.error("Failed to load recruiters");
      } finally {
        setLoading((prev) => ({ ...prev, recruiters: false }));
      }
    };

    fetchRecruiters();
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/student/students`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch students");
        }

        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading((prev) => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.fullname
        .toLowerCase()
        .includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (student.profile?.skills || []).some((skill) =>
        skill.toLowerCase().includes(studentSearchTerm.toLowerCase())
      )
  );

  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter(
    (recruiter) =>
      recruiter.companyname
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.email
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.cinnumber
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase())
  );

  // Pagination logic for students
  const indexOfLastStudent = currentStudentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Pagination logic for recruiters
  const indexOfLastRecruiter = currentRecruiterPage * itemsPerPage;
  const indexOfFirstRecruiter = indexOfLastRecruiter - itemsPerPage;
  const currentRecruiters = filteredRecruiters.slice(
    indexOfFirstRecruiter,
    indexOfLastRecruiter
  );
  const totalRecruiterPages = Math.ceil(
    filteredRecruiters.length / itemsPerPage
  );

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/recruiter-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve recruiter");
      }

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));

      // Refresh recruiters list
      const recruitersResponse = await fetch(
        `${apiUrl}/api/v1/recruiter/recruiters`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const recruitersData = await recruitersResponse.json();
      if (recruitersData.success && Array.isArray(recruitersData.recruiters)) {
        setRecruiters(recruitersData.recruiters);
      }

      toast.success(data.message || "Recruiter approved successfully");
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reject recruiter");
      }

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Recruiter request rejected successfully");
    } catch (error) {
      console.error("Error rejecting recruiter:", error);
      toast.error(error.message || "Failed to reject recruiter");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      const response = await fetch(`${apiUrl}/api/v1/student/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student");
      }

      setStudents((prev) => prev.filter((s) => s._id !== id));
      toast.success(data.message || "Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleDeleteRecruiter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Recruiter?"))
      return;

    try {
      const response = await fetch(`${apiUrl}/api/v1/recruiter/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete recruiter");
      }

      setRecruiters((prev) => prev.filter((s) => s._id !== id));
      toast.success(data.message || "Recruiter deleted successfully");
    } catch (error) {
      console.error("Error deleting recruiter:", error);
      toast.error(error.message || "Failed to delete Recruiter");
    }
  };

  // Helper function to get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
              <Users className="h-4 w-4 mr-2" />
              {students.length} Students
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-500/20 text-purple-400"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              {recruiters.length} Recruiters
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-950 p-1 mb-8 w-full">
            <TabsTrigger
              value="students"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-400"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger
              value="recruiters"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-400"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Recruiters
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-lg font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-400"
            >
              <Users className="w-5 h-5 mr-2" />
              Pending Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white">
                    Student Management
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
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
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 w-full bg-gray-800 rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[500px] rounded-md border border-gray-800">
                      <Table>
                        <TableHeader className="bg-gray-900 sticky top-0">
                          <TableRow>
                            <TableHead className="text-gray-300">
                              Profile
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Name
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Email
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Phone
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Skills
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Joined
                            </TableHead>
                            <TableHead className="text-right text-gray-300">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentStudents.length > 0 ? (
                            currentStudents.map((student) => (
                              <TableRow
                                key={student._id}
                                className="border-gray-800 hover:bg-gray-900/50"
                              >
                                <TableCell>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={student.profile?.profilePhoto}
                                    />
                                    <AvatarFallback>
                                      {getInitials(student.fullname)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                  {student.fullname}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {student.email}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {student.phonenumber || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {(student.profile?.skills || [])
                                      .slice(0, 3)
                                      .map((skill, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    {(student.profile?.skills || []).length >
                                      3 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-700 text-gray-400"
                                      >
                                        +
                                        {(student.profile?.skills || [])
                                          .length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {new Date(
                                    student.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteStudent(student._id)
                                    }
                                    className="h-8"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan="7"
                                className="h-24 text-center text-gray-400"
                              >
                                {students.length === 0
                                  ? "No students found"
                                  : "No matching students found"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    {totalStudentPages > 1 && (
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentStudentPage((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          disabled={currentStudentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-400">
                          Page {currentStudentPage} of {totalStudentPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentStudentPage((prev) =>
                              Math.min(prev + 1, totalStudentPages)
                            )
                          }
                          disabled={currentStudentPage === totalStudentPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiters">
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white">
                    Recruiter Management
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search recruiters..."
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
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
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 w-full bg-gray-800 rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[500px] rounded-md border border-gray-800">
                      <Table>
                        <TableHeader className="bg-gray-900 sticky top-0">
                          <TableRow>
                            <TableHead className="text-gray-300">
                              Logo
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Company
                            </TableHead>
                            <TableHead className="text-gray-300">
                              Email
                            </TableHead>
                            <TableHead className="text-gray-300">CIN</TableHead>
                            <TableHead className="text-gray-300">
                              Address
                            </TableHead>
                            <TableHead className="text-right text-gray-300">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRecruiters.length > 0 ? (
                            currentRecruiters.map((rec) => (
                              <TableRow
                                key={rec._id}
                                className="border-gray-800 hover:bg-gray-900/50"
                              >
                                <TableCell>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={rec.profile?.profilePhoto}
                                    />
                                    <AvatarFallback>
                                      {getInitials(rec.companyname)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                  {rec.companyname}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {rec.email}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {rec.cinnumber}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {rec.companyaddress}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteRecruiter(rec._id)
                                    }
                                    className="h-8"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan="6"
                                className="h-24 text-center text-gray-400"
                              >
                                {recruiters.length === 0
                                  ? "No recruiters found"
                                  : "No matching recruiters found"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    {totalRecruiterPages > 1 && (
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentRecruiterPage((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          disabled={currentRecruiterPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-400">
                          Page {currentRecruiterPage} of {totalRecruiterPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentRecruiterPage((prev) =>
                              Math.min(prev + 1, totalRecruiterPages)
                            )
                          }
                          disabled={
                            currentRecruiterPage === totalRecruiterPages
                          }
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Recruiter Approval Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.requests ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-32 w-full bg-gray-800 rounded-lg"
                      />
                    ))}
                  </div>
                ) : recruiterRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recruiterRequests.map((req) => (
                      <Card
                        key={req._id}
                        className="bg-gray-900 border-gray-800"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16 border-2 border-blue-500">
                                <AvatarImage src={req.profile?.profilePhoto} />
                                <AvatarFallback className="bg-gray-800 text-blue-400">
                                  {getInitials(req.companyname)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {req.companyname}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {req.email}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-700 text-gray-400"
                                  >
                                    CIN: {req.cinnumber}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-700 text-gray-400"
                                  >
                                    Phone: {req.phonenumber || "N/A"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300 mb-4">
                                <span className="font-medium text-white">
                                  Address:
                                </span>{" "}
                                {req.companyaddress}
                              </p>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(req._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(req._id)}
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No pending recruiter requests
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
