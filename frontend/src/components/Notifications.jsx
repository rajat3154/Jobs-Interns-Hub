import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Bell,
  CheckCircle,
  Zap,
  Briefcase,
  AlertCircle,
  UserPlus,
  UserCheck,
  Loader2,
  X,
  Mail,
  MessageSquare,
  ThumbsUp,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Navbar from "./shared/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const socket = useSocket();

  // Filter notifications based on active tab
  // Only show 'follow' and 'application' notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return ["follow", "application"].includes(notification.type);
    if (activeTab === "unread") return !notification.read && ["follow", "application"].includes(notification.type);
    return notification.type === activeTab && ["follow", "application"].includes(notification.type);
  });

  // Helper function to get sender name
  const getSenderName = (notification) => {
    if (!notification.sender) return "A user";
    return (
      notification.sender.fullname ||
      notification.sender.companyname ||
      "A user"
    );
  };

  // Handler for new notifications received via socket
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notification._id)) {
        return prev; // Avoid duplicates
      }
      // Play notification sound
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(() => {});
      toast.success("New notification received!");
      return [notification, ...prev];
    });
  }, []);

  // Setup socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.off("newNotification");
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
          withCredentials: true,
        });
        setNotifications(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/notifications/read/${notificationId}`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  // Get appropriate icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case "job":
        return <Briefcase className="w-5 h-5 text-green-400" />;
      case "application":
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      case "system":
        return <Zap className="w-5 h-5 text-purple-400" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      case "like":
        return <ThumbsUp className="w-5 h-5 text-pink-400" />;
      case "save":
        return <Bookmark className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-black rounded-xl shadow-xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Notifications
            </h2>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-white hover:bg-blue-900/30"
                disabled={notifications.every((n) => n.read)}
              >
                Mark all as read
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-400" />
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              </div>
            </div>
          </div>

          {/* Notification tabs */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
            {[
              "all",
              "unread",
              "follow",
              "application"
            ].map(
              (tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full capitalize text-white ${
                    activeTab === tab ? "bg-blue-600" : "hover:bg-gray-800"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "unread"
                    ? "Unread"
                    : tab === "follow"
                    ? "Follows"
                    : tab === "application"
                    ? "Applications"
                    : tab}
                </Button>
              )
            )}
          </div>

          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-8"
              >
                <Bell className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p>
                  No {activeTab === "all" ? "" : activeTab} notifications yet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your {activeTab === "all" ? "" : activeTab} notifications will
                  appear here
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-full sm:max-w-2xl mx-auto border-blue-600 bg-gray-950 rounded-lg shadow border border-gray-800 p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-left break-words"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={notification.sender?.profile?.profilePhoto} />
                      <AvatarFallback className="bg-gray-700 text-blue-400">
                        {(notification.sender?.fullname || notification.sender?.companyname || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-base truncate">
                        {notification.sender?.fullname || notification.sender?.companyname || 'User'}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {notification.sender?.email || ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {/* Removed getNotificationIcon(notification.type) */}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-100">
                        {notification.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="mt-3 inline-block text-blue-400 text-sm hover:underline"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        View details
                      </Link>
                    )}
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      className="flex-shrink-0 text-blue-400 hover:bg-blue-900/30"
                    >
                      Mark as read
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default Notifications;
