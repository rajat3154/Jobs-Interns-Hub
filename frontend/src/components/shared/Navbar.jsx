import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, User2, Menu, X } from "lucide-react";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const apiUrl = import.meta.env.VITE_API_URL;
  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/logout`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-black">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-20 px-4">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl font-bold text-white">
            JobIntern<span className="text-[#3B82F6]">Hub</span>
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <div className="flex items-center sm:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-gray-300 focus:outline-none sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6">
          <ul className="flex font-medium items-center gap-5 text-gray-300">
            {user?.role === "recruiter" && (
              <>
               
               
                <li>
                  <Link
                    to="/discover"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Peoples
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notifications"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Messages
                  </Link>
                </li>
              </>
            )}
            {user?.role === "student" && (
              <>
                <li>
                  <Link
                    to="/"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/discover"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Peoples
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/internships"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Internships
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Messages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notifications"
                    className="hover:text-white transition duration-300 cursor-pointer"
                  >
                    Notifications
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Avatar className="w-8 h-8 rounded-full cursor-pointer border border-gray-500">
                    <AvatarImage
                      src={
                        user?.profile?.profilePhoto || "/default-profile.png"
                      }
                      alt="Profile Picture"
                    />
                    <AvatarFallback>
                      {(user?.fullname || user?.companyname || "U")
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>

              <PopoverContent
                side="bottom"
                align="start"
                className="w-64 p-4 bg-black border-gray-700 text-gray-300 rounded-lg absolute z-50 right-0"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-10 h-10 rounded-full border border-gray-500">
                    <AvatarImage
                      src={
                        user?.profile?.profilePhoto || "/default-profile.png"
                      }
                      alt="Profile Picture"
                    />
                    <AvatarFallback>
                      {(user?.fullname || user?.companyname || "U")
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-xs overflow-hidden">
                    <h4 className="font-medium text-lg text-white">
                      {user?.role === "recruiter"
                        ? user.companyname
                        : user.fullname}
                    </h4>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="space-y-2">
                  {(user?.role === "student" || user?.role === "recruiter") && (
                    <div className="flex items-center gap-2 cursor-pointer">
                      <User2 className="text-gray-300" />
                      <Button
                        variant="link"
                        className="text-gray-300 p-0 h-auto"
                      >
                        <Link
                          to={
                            user?.role === "recruiter"
                              ? "/recruiter/profile"
                              : "/profile"
                          }
                          className="hover:text-white"
                        >
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="text-gray-300" />
                    <Button
                      onClick={logoutHandler}
                      variant="link"
                      className="text-gray-300 hover:text-white cursor-pointer"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-start pt-24 px-6 sm:hidden transition-all">
            <ul className="flex flex-col gap-6 text-lg font-medium text-gray-300 w-full items-center">
              {user?.role === "recruiter" && (
                <>
                  <li>
                    <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Peoples</Link>
                  </li>
                  <li>
                    <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Notifications</Link>
                  </li>
                  <li>
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Messages</Link>
                  </li>
                </>
              )}
              {user?.role === "student" && (
                <>
                  <li>
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Home</Link>
                  </li>
                  <li>
                    <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Peoples</Link>
                  </li>
                  <li>
                    <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Jobs</Link>
                  </li>
                  <li>
                    <Link to="/internships" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Internships</Link>
                  </li>
                  <li>
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Messages</Link>
                  </li>
                  <li>
                    <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Notifications</Link>
                  </li>
                </>
              )}
              {!user && (
                <>
                  <li>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Login</Link>
                  </li>
                  <li>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition duration-300 cursor-pointer">Signup</Link>
                  </li>
                </>
              )}
            </ul>
            {user && (
              <div className="mt-8 flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-full border border-gray-500">
                    <AvatarImage src={user?.profile?.profilePhoto || "/default-profile.png"} alt="Profile Picture" />
                    <AvatarFallback>
                      {(user?.fullname || user?.companyname || "U").split(" ").map((word) => word[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h4 className="font-medium text-base text-white">{user?.role === "recruiter" ? user.companyname : user.fullname}</h4>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Button asChild variant="link" className="text-gray-300 w-full text-left px-0" onClick={() => setMobileMenuOpen(false)}>
                    <Link to={user?.role === "recruiter" ? "/recruiter/profile" : "/profile"}>View Profile</Link>
                  </Button>
                  <Button onClick={() => { logoutHandler(); setMobileMenuOpen(false); }} variant="link" className="text-gray-300 w-full text-left px-0">Logout</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
