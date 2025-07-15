import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser, setOnlineUsers } from "../../redux/authSlice";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import Navbar from "../shared/Navbar";
import { Menu } from "lucide-react";

const ChatHome = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (!authUser?._id) return;

    // Initialize socket connection
    socket.current = io(`${apiUrl}`, {
      withCredentials: true,
    });

    // Setup user connection
    socket.current.emit("setup", authUser._id);

    // Listen for user status updates
    socket.current.on("user:status", ({ userId, isOnline }) => {
      dispatch(setOnlineUsers({ userId, isOnline }));
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [authUser?._id, dispatch]);

  // Check for selected user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setSelectedUser(parsedUser));
      // Clear the stored user after setting it
      localStorage.removeItem("selectedUser");
    }
  }, [dispatch]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-black mx-auto h-screen">
        <div className="flex justify-center w-7xl h-150 bg-black mx-auto relative">
          {/* Hamburger for mobile */}
          <button
            className="absolute top-4 left-4 z-50 sm:hidden text-gray-300"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat list"
            style={{ display: sidebarOpen ? 'none' : 'block' }}
          >
            <Menu className="h-7 w-7" />
          </button>
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={(user) => {
              handleSelectUser(user);
              setSidebarOpen(false); // close sidebar on mobile after selecting
            }}
            unreadCounts={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            socket={socket}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <MessageContainer
            selectedUser={selectedUser}
            unreadCounts={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            socket={socket}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </div>
    </>
  );
};

export default ChatHome;
