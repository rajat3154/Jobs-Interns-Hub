import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, User2, Menu } from "lucide-react";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Helper for nav links
  const navLinks = (
    <ul className="flex flex-col md:flex-row font-medium items-center gap-4 md:gap-5 text-gray-300">
      {user?.role === "recruiter" && (
        <>
          <li>
            <Link
              to="/discover"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Peoples
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notifications
            </Link>
          </li>
          <li>
            <Link
              to="/messages"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/discover"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Peoples
            </Link>
          </li>
          <li>
            <Link
              to="/jobs"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/internships"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Internships
            </Link>
          </li>
          <li>
            <Link
              to="/messages"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className="hover:text-white transition duration-300 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notifications
            </Link>
          </li>
        </>
      )}
    </ul>
  );

  return (
    <div className="bg-black w-full z-50 sticky top-0">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 sm:h-20 px-4 relative">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-white">
            JobIntern<span className="text-[#3B82F6]">Hub</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
          {!user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-gray-700 hover:text-white cursor-pointer px-4 py-2 text-sm"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer px-4 py-2 text-sm">
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

        {/* Hamburger for Mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7 text-white" />
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-start pt-24 px-6 md:hidden transition-all">
            <button
              className="absolute top-6 right-6 text-white text-3xl"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
            <div className="flex flex-col items-center gap-6 w-full">
              {navLinks}
              {!user ? (
                <div className="flex flex-col items-center gap-3 w-full mt-4">
                  <Link to="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="border-gray-500 text-white hover:bg-gray-700 hover:text-white cursor-pointer w-full py-3 text-base"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer w-full py-3 text-base">
                      Signup
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full mt-4">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="w-12 h-12 rounded-full border border-gray-500">
                      <AvatarImage
                        src={user?.profile?.profilePhoto || "/default-profile.png"}
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
                    <h4 className="font-medium text-lg text-white mt-2">
                      {user?.role === "recruiter"
                        ? user.companyname
                        : user.fullname}
                    </h4>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <Link
                    to={user?.role === "recruiter" ? "/recruiter/profile" : "/profile"}
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full py-3 text-base">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    onClick={() => { setMobileMenuOpen(false); logoutHandler(); }}
                    variant="outline"
                    className="w-full py-3 text-base text-red-400 border-red-400 hover:bg-red-500/10 hover:text-white"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
