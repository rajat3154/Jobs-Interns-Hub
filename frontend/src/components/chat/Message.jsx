import React from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

const Message = ({ message }) => {
  const { user: authUser } = useSelector((store) => store.auth);
  const isOwnMessage = message.senderId === authUser._id;

  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      } mb-2 px-1 sm:px-0`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-2 break-words shadow-md ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-gray-950 text-white rounded-tl-none"
        }`}
      >
        <p className="text-sm break-words">{message.message}</p>
        <p className="text-xs text-gray-300 mt-1 text-right">
          {format(new Date(message.createdAt), "HH:mm")}
        </p>
      </div>
    </div>
  );
};

export default Message;
