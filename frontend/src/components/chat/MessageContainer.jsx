import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SendIcon } from "lucide-react";
import axios from "axios";
import { setMessages } from "../../redux/messageSlice";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChevronLeft, Paperclip, Send, Smile, Video } from "lucide-react";
import toast from "react-hot-toast";
import Message from "./Message";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MessageContainer = ({ selectedUser, unreadCounts, setUnreadCounts, socket, sidebarOpen, setSidebarOpen }) => {
      const { user: authUser } = useSelector((state) => state.auth);
      const { onlineUsers = [] } = useSelector((state) => state.auth);
      const { messages } = useSelector((state) => state.message);
      const dispatch = useDispatch();
      const [newMessage, setNewMessage] = useState("");
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [conversations, setConversations] = useState({});
      const messagesEndRef = useRef(null);
      const [isTyping, setIsTyping] = useState(false);
      const typingTimeoutRef = useRef(null);

      const isUserOnline = (userId) => {
            return Array.isArray(onlineUsers) && onlineUsers.includes(userId);
      };

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      useEffect(() => {
            if (!selectedUser?._id) return;

            const fetchMessages = async () => {
                  try {
                        setLoading(true);
                        const response = await axios.get(
                              `${API_BASE_URL}/api/v1/message/${selectedUser._id}`,
                              { withCredentials: true }
                        );

                        if (response.data.success) {
                              const fetchedMessages = response.data.messages;
                              setConversations(prev => ({
                                    ...prev,
                                    [selectedUser._id]: fetchedMessages
                              }));
                              dispatch(setMessages(fetchedMessages));
                        }
                  } catch (error) {
                        console.error("Error fetching messages:", error);
                        toast.error("Failed to load messages");
                        dispatch(setMessages([]));
                  } finally {
                        setLoading(false);
                  }
            };

            if (conversations[selectedUser?._id]) {
                  dispatch(setMessages(conversations[selectedUser._id]));
            } else {
                  fetchMessages();
            }
      }, [selectedUser?._id, dispatch, conversations]);

      useEffect(() => {
            if (socket.current && selectedUser) {
                  const handleNewMessage = (newMessage) => {
                        if (
                              (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
                              (newMessage.senderId === authUser._id && newMessage.receiverId === selectedUser._id)
                        ) {
                              dispatch(setMessages([...messages, newMessage]));
                              scrollToBottom();
                        }
                  };
                  const handleTyping = (senderId) => {
                        if (senderId === selectedUser._id) {
                              console.log(`[MessageContainer] Received typing from ${senderId}`);
                              setIsTyping(true);
                        }
                  };
                  const handleStopTyping = (senderId) => {
                        if (senderId === selectedUser._id) {
                              console.log(`[MessageContainer] Received stop_typing from ${senderId}`);
                              setIsTyping(false);
                        }
                  };

                  socket.current.on("message:new", handleNewMessage);
                  socket.current.on("typing", handleTyping);
                  socket.current.on("stop_typing", handleStopTyping);

                  return () => {
                        socket.current.off("message:new", handleNewMessage);
                        socket.current.off("typing", handleTyping);
                        socket.current.off("stop_typing", handleStopTyping);
                  };
            }
      }, [selectedUser, authUser._id, dispatch, messages]);

      const handleSendMessage = async (e) => {
            e.preventDefault();
            if (!newMessage.trim() || !selectedUser?._id) return;
            // Clear typing status when sending message
            if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                  socket.current?.emit("stop_typing", { receiverId: selectedUser._id });
            }
            setIsTyping(false);

            try {
                  const response = await axios.post(
                        `${API_BASE_URL}/api/v1/message/send/${selectedUser._id}`,
                        { message: newMessage.trim() },
                        { withCredentials: true }
                  );

                  if (response.data.success && response.data.newMessage) {
                        const currentMessages = conversations[selectedUser._id] || [];
                        const updatedMessages = [...currentMessages, response.data.newMessage];

                        setConversations(prev => ({
                              ...prev,
                              [selectedUser._id]: updatedMessages
                        }));

                        dispatch(setMessages(updatedMessages));
                        setNewMessage("");
                        scrollToBottom();

                        // Emit socket event for real-time update
                        socket.current?.emit("new_message", response.data.newMessage);
                  }
            } catch (error) {
                  console.error("Error sending message:", error);
                  toast.error("Failed to send message");
            }
      };

      const handleTypingChange = (e) => {
            setNewMessage(e.target.value);
            if (e.target.value.length > 0) {
                  // Emit typing event
                  console.log(`[MessageContainer] Emitting typing to ${selectedUser._id}`);
                  socket.current?.emit("typing", { receiverId: selectedUser._id });
                  if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                        console.log(`[MessageContainer] Emitting stop_typing (timeout) to ${selectedUser._id}`);
                        socket.current?.emit("stop_typing", { receiverId: selectedUser._id });
                  }, 1000);
            } else {
                  // Emit stop_typing event if text becomes empty
                  if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                  }
                  console.log(`[MessageContainer] Emitting stop_typing (empty text) to ${selectedUser._id}`);
                  socket.current?.emit("stop_typing", { receiverId: selectedUser._id });
            }
      };

      if (!selectedUser) {
            return (
                  <div className={`flex-1 flex items-center justify-center bg-black ${sidebarOpen ? 'hidden sm:flex' : ''}`}>
                        <p className="text-gray-400">Select a user to start chatting</p>
                  </div>
            );
      }

      return (
            <div className={`flex-1 flex flex-col bg-black ${sidebarOpen ? 'hidden sm:flex' : ''}`}>
                  {/* Chat header */}
                  <div className="p-4 border-b border-t border-r border-gray-800 flex items-center bg-gray-950">
                        {/* Hamburger for mobile if sidebar is closed */}
                        {!sidebarOpen && (
                          <button
                            className="sm:hidden mr-2 text-gray-400 hover:text-white"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open chat list"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                          </button>
                        )}

                        <Avatar className="h-10 w-10 border-2 border-blue-500">
                              <AvatarImage src={selectedUser.profilePhoto} />
                              <AvatarFallback>{selectedUser.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="ml-3">
                              <h3 className="font-semibold text-white">{selectedUser.fullName}</h3>
                              <div className="flex items-center">
                                    {isTyping ? (
                                          <div className="flex items-center text-xs text-green-500">
                                                <p className="mr-1">{selectedUser.fullName} is typing</p>
                                                <div className="dot-animation">
                                                      <span className="dot">.</span>
                                                      <span className="dot">.</span>
                                                      <span className="dot">.</span>
                                                </div>
                                          </div>
                                    ) : (
                                          <>
                                                <div
                                                      className={`h-2 w-2 rounded-full mr-1 ${
                                                            isUserOnline(selectedUser._id) ? "bg-green-500" : "bg-gray-500"
                                                      }`}
                                                ></div>
                                                <p className="text-xs text-gray-400">
                                                      {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
                                                </p>
                                          </>
                                    )}
                              </div>
                        </div>

                        <div className="ml-auto">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-blue-400"
                              >
                                    <Video className="h-5 w-5" />
                              </Button>
                        </div>
                  </div>

                  {/* Error message */}
                  {error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                              {error}
                        </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                              <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                        ) : (Array.isArray(messages) && messages.length > 0) ? (
                              messages.map((message) => (
                                    <Message key={message._id} message={message} />
                              ))
                        ) : (
                              <div className="flex justify-center items-center h-full">
                                    <p className="text-gray-400">Say hello!</p>
                              </div>
                        )}

                       
                        <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="p-4 border-t border-r border-b border-gray-800">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                              <Input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={handleTypingChange}
                                    className="flex-1 bg-gray-950 border-gray-700 text-white focus:ring-blue-500/50"
                              />
                              <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className={`p-2 rounded-md ${
                                          newMessage.trim()
                                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                : "bg-gray-950 text-gray-400 cursor-not-allowed"
                                    }`}
                              >
                                    <SendIcon className="h-5 w-5" />
                              </button>
                        </form>
                  </div>
            </div>
      );
};

export default MessageContainer;


