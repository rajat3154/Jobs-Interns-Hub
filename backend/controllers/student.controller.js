import { Recruiter } from "../models/recruiter.model.js";
import { Student } from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { getIO } from "../socket/socket.js";


export const sregister = async (req, res) => {
      try {
            const { fullname, email, phonenumber, password, role, status } = req.body;

            // Check required fields
            if (!fullname || !email || !phonenumber || !password || !status || !role) {
                  return res.status(400).json({
                        message: "All fields are required",
                        success: false
                  });
            }

            // Role validation
            if (role !== "student") {
                  return res.status(400).json({
                        message: "Invalid role",
                        success: false
                  });
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                  return res.status(400).json({
                        message: "Email already exists",
                        success: false
                  });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Prepare student data
            const studentData = {
                  fullname,
                  email,
                  phonenumber,
                  password: hashedPassword,
                  role: "student",
                  status,
                  profile: {}
            };

            // Handle optional profile photo
            if (req.files && req.files.profilePhoto && req.files.profilePhoto.length > 0) {
                  const file = req.files.profilePhoto[0];
                
                  const fileUri = getDataUri(file);
                  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                  studentData.profile.profilePhoto = cloudResponse.secure_url;
            }

            // Create student
            await Student.create(studentData);

            return res.status(201).json({
                  message: "Account created successfully",
                  success: true,
            });

      } catch (error) {
            console.error("Error in sregister:", error);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
                  error: error.message,
            });
      }
};
    
    



export const login = async (req, res) => {
      try {
            const { email, password, role } = req.body;

            if (!email || !password || !role) {
                  return res.status(400).json({
                        message: "All fields are required",
                        success: false,
                  });
            }

            // 🔐 Admin login
            if (role === "admin") {
                  if (email !== "admin@gmail.com" || password !== "admin") {
                        return res.status(400).json({
                              message: "Invalid admin credentials",
                              success: false,
                        });
                  }

                  const adminUser = {
                        _id: "admin_default_id",
                        email,
                        role,
                        fullname: "Admin",
                  };

                  const token = jwt.sign(
                        { userId: adminUser._id, role: "admin" },
                        process.env.SECRET_KEY,
                        { expiresIn: "1d" }
                  );

                  return res
                        .status(200)
                        .cookie("token", token, {
                              maxAge: 24 * 60 * 60 * 1000,
                              httpOnly: true,
                              secure: false,
                              sameSite: "lax",
                        })
                        .json({
                              message: "Welcome Admin",
                              success: true,
                              user: adminUser,
                              token,
                        });
            }

            // 🔍 Determine model based on role
            const userModel = role === "student" ? Student : Recruiter;
            const user = await userModel.findOne({ email });

            if (!user) {
                  return res.status(400).json({
                        message: "Incorrect email or password",
                        success: false,
                  });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                  return res.status(400).json({
                        message: "Incorrect email or password",
                        success: false,
                  });
            }

            if (role !== user.role) {
                  return res.status(400).json({
                        message: "Account does not exist with current role",
                        success: false,
                  });
            }

            // ✅ INCLUDE role in token!
            const token = jwt.sign(
                  { userId: user._id, role: user.role },
                  process.env.SECRET_KEY,
                  { expiresIn: "1d" }
            );

            const userResponse =
                  role === "student"
                        ? {
                              _id: user._id,
                              fullname: user.fullname,
                              email: user.email,
                              phonenumber: user.phonenumber,
                              role: user.role,
                              status: user.status,
                              profile: user.profile,
                        }
                        : {
                              _id: user._id,
                              companyname: user.companyname,
                              email: user.email,
                              cinnumber: user.cinnumber,
                              role: user.role,
                              status: user.status,
                              profile: user.profile,
                        };

            const welcomeMessage =
                  role === "student"
                        ? `Welcome back ${user.fullname}`
                        : `Welcome back ${user.companyname}`;

            return res
                  .status(200)
                  .cookie("token", token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "Lax",
                  })
                  .json({
                        message: welcomeMessage,
                        success: true,
                        user: userResponse,
                        token,
                        debugCookies: req.cookies,
                  });
      } catch (error) {
            console.error("Login Error:", error.message);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
            });
      }
};
export const logout = async (req, res) => {
      try {
            // Clear the cookie first
            res.clearCookie("token");

            // Only try to update lastSeen and emit socket event if we have user info
            if (req.user && req.user._id) {
                  const userId = req.user._id;
                  const userRole = req.user.role;

                  // Update lastSeen timestamp
                  const userModel = userRole === 'student' ? Student : Recruiter;
                  await userModel.findByIdAndUpdate(userId, { lastSeen: new Date() });

                  // Emit offline status through socket
                  const io = getIO();
                  if (io) {
                        io.emit("user:status", { userId, isOnline: false });
                  }
            }

            return res.status(200).json({
                  message: "Logged out successfully",
                  success: true,
            });
      } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({
                  message: "Error during logout",
                  success: false,
            });
      }
};
export const updateProfile = async (req, res) => {
      try {
            const { fullname, email, phonenumber, bio, skills } = req.body;
            const userId = req.user._id;

            // Find the student
            const student = await Student.findById(userId);
            if (!student) {
                  return res.status(404).json({
                        message: "Student not found",
                        success: false
                  });
            }

            // Update basic info
            student.fullname = fullname || student.fullname;
            student.email = email || student.email;
            student.phonenumber = phonenumber || student.phonenumber;

            // Initialize profile if it doesn't exist
            if (!student.profile) {
                  student.profile = {};
            }

            // Update profile fields
            student.profile.bio = bio || student.profile.bio;
            student.profile.skills = skills ? skills.split(',').map(skill => skill.trim()) : student.profile.skills;

            // Handle profile photo upload
            if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
                  const file = req.files.profilePhoto[0];
                  const fileUri = getDataUri(file);
                  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                  student.profile.profilePhoto = cloudResponse.secure_url;
            }

            // Handle resume upload
            if (req.files && req.files.file && req.files.file[0]) {
                  const file = req.files.file[0];
                  const fileUri = getDataUri(file);
                  const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                        resource_type: "raw",
                        format: "pdf"
                  });
                  student.profile.resume = cloudResponse.secure_url;
                  student.profile.resumeOriginalName = file.originalname;
            }

            // Save the updated student
            await student.save();

            // Return updated user data
            const updatedUser = {
                  _id: student._id,
                  fullname: student.fullname,
                  email: student.email,
                  phonenumber: student.phonenumber,
                  role: student.role,
                  status: student.status,
                  profile: student.profile
            };

            return res.status(200).json({
                  message: "Profile updated successfully",
                  success: true,
                  user: updatedUser
            });

      } catch (error) {
            console.error("Error in updateProfile:", error);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
                  error: error.message
            });
      }
};
export const getAllStudents = async (req, res) => {
      try {
            const students = await Student.find().sort({ createdAt: -1 });

            return res.status(200).json({
                  success: true,
                  students,
            });
      } catch (error) {
            console.error("Error fetching students:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch students",
            });
      }
};
export const isAdmin = (req, res, next) => {
      if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                  success: false,
                  message: "Access denied. Admins only.",
            });
      }
      next();
};

// controllers/studentController.js



// DELETE /api/v1/students/:id
export const deleteStudent = async (req, res) => {
      try {
            const studentId = req.params.id;

            // Optional: Only admin can delete, check if user is admin
            if (req.user.role !== "admin") {
                  return res.status(403).json({ message: "Access denied. Admins only." });
            }

            const deletedStudent = await Student.findByIdAndDelete(studentId);

            if (!deletedStudent) {
                  return res.status(404).json({ message: "Student not found." });
            }

            res.status(200).json({ message: "Student deleted successfully." });
      } catch (error) {
            console.error("Error deleting student:", error);
            res.status(500).json({ message: "Server error while deleting student." });
      }
};

export const getOtherUsers = async (req, res) => {
      try {
            const loggedInUserId = req.id;
            const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
            return res.status(200).json(otherUsers);
      } catch (error) {
            console.log(error);
      }
  }
