import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  LogOut,
  User2,
  Menu,
  X,
  Home,
  Users,
  Briefcase,
  Bell,
  Mail,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? "auto" : "hidden";
  };

  return (
    <div
      className={`bg-black sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:h-20">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
          JobIntern<span className="text-[#3B82F6]">Hub</span>
        </Link>

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

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="text-gray-300 focus:outline-none sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut" }}
              className="fixed inset-0 z-40 bg-black bg-opacity-95 flex flex-col items-center justify-start pt-20 px-6 sm:hidden"
            >
              <div className="w-full max-w-sm">
                <ul className="flex flex-col gap-4 text-lg font-medium text-gray-300 w-full">
                  {user?.role === "recruiter" && (
                    <>
                      <MobileNavItem
                        to="/discover"
                        icon={<Users className="w-5 h-5" />}
                        text="Peoples"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/notifications"
                        icon={<Bell className="w-5 h-5" />}
                        text="Notifications"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/messages"
                        icon={<Mail className="w-5 h-5" />}
                        text="Messages"
                        onClick={closeMobileMenu}
                      />
                    </>
                  )}
                  {user?.role === "student" && (
                    <>
                      <MobileNavItem
                        to="/"
                        icon={<Home className="w-5 h-5" />}
                        text="Home"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/discover"
                        icon={<Users className="w-5 h-5" />}
                        text="Peoples"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/jobs"
                        icon={<Briefcase className="w-5 h-5" />}
                        text="Jobs"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/internships"
                        icon={<Briefcase className="w-5 h-5" />}
                        text="Internships"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/messages"
                        icon={<Mail className="w-5 h-5" />}
                        text="Messages"
                        onClick={closeMobileMenu}
                      />
                      <MobileNavItem
                        to="/notifications"
                        icon={<Bell className="w-5 h-5" />}
                        text="Notifications"
                        onClick={closeMobileMenu}
                      />
                    </>
                  )}
                  {!user && (
                    <>
                      <li className="mt-4">
                        <Link
                          to="/login"
                          onClick={closeMobileMenu}
                          className="block w-full py-3 px-4 rounded-lg bg-gray-900 text-center hover:bg-gray-800 transition duration-300"
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/signup"
                          onClick={closeMobileMenu}
                          className="block w-full py-3 px-4 rounded-lg bg-blue-600 text-center hover:bg-blue-500 transition duration-300"
                        >
                          Signup
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                {user && (
                  <div className="mt-8 flex flex-col gap-4 w-full border-t border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-full border border-gray-500">
                        <AvatarImage
                          src={
                            user?.profile?.profilePhoto ||
                            "/default-profile.png"
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
                      <div className="text-left">
                        <h4 className="font-medium text-base text-white">
                          {user?.role === "recruiter"
                            ? user.companyname
                            : user.fullname}
                        </h4>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={closeMobileMenu}
                      >
                        <Link
                          to={
                            user?.role === "recruiter"
                              ? "/recruiter/profile"
                              : "/profile"
                          }
                        >
                          <User2 className="w-5 h-5" />
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        onClick={() => {
                          logoutHandler();
                          closeMobileMenu();
                        }}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MobileNavItem = ({ to, icon, text, onClick }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-300"
    >
      <span className="text-blue-400">{icon}</span>
      <span>{text}</span>
    </Link>
  </li>
);

export default Navbar;
