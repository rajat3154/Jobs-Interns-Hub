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
            className="sm:hidden absolute top-4 left-4 z-50 text-gray-300 bg-gray-900 rounded-full p-2 shadow-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat list"
            style={{ display: sidebarOpen ? 'none' : 'block' }}
          >
            <Menu className="h-7 w-7" />
          </button>

          {/* Sidebar (chat list) */}
          {/* Desktop: always show sidebar; Mobile: show overlay only when open */}
          <div>
            <div
              className={`
                sm:block
                ${
                  sidebarOpen
                    ? 'fixed inset-0 z-40 bg-black bg-opacity-90 transition-transform duration-300 w-4/5 max-w-xs h-full sm:static sm:bg-transparent sm:z-auto sm:w-1/3 sm:h-auto sm:translate-x-0'
                    : 'hidden sm:block sm:w-1/3'
                }
              `}
            >
              <Sidebar
                selectedUser={selectedUser}
                onSelectUser={(user) => {
                  handleSelectUser(user);
                  setSidebarOpen(false);
                }}
                unreadCounts={unreadCounts}
                setUnreadCounts={setUnreadCounts}
                socket={socket}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col h-full w-full sm:w-2/3">
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
