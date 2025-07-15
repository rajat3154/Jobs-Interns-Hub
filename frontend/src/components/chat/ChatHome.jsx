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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    setMobileSidebarOpen(false); // Close sidebar on mobile when a user is selected
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-black mx-auto h-screen">
        <div className="flex justify-center w-full max-w-7xl h-full bg-black mx-auto">
          {/* Mobile Hamburger */}
          <button
            className="sm:hidden absolute top-20 left-4 z-50 p-2 text-gray-300 bg-gray-900 rounded-full shadow-lg"
            onClick={() => setMobileSidebarOpen(true)}
            style={{ display: selectedUser && !mobileSidebarOpen ? 'none' : undefined }}
            aria-label="Open chat list"
          >
            <Menu className="h-7 w-7" />
          </button>

          {/* Sidebar (Chat List) */}
          <div
            className={`${
              mobileSidebarOpen ? 'fixed inset-0 z-40 bg-black bg-opacity-95 flex sm:static sm:w-1/3' :
              'hidden sm:block sm:w-1/3'
            } transition-all`}
            style={{ maxWidth: '100vw' }}
          >
            <Sidebar
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              unreadCounts={unreadCounts}
              setUnreadCounts={setUnreadCounts}
              socket={socket}
            />
            {/* Close button for mobile sidebar */}
            <button
              className="sm:hidden absolute top-4 right-4 z-50 p-2 text-gray-300 bg-gray-900 rounded-full shadow-lg"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close chat list"
            >
              ×
            </button>
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 h-full ${mobileSidebarOpen && !selectedUser ? 'hidden' : 'block'}`}
          >
            <MessageContainer
              selectedUser={selectedUser}
              unreadCounts={unreadCounts}
              setUnreadCounts={setUnreadCounts}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHome;
