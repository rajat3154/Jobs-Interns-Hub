import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Search, Rocket, Sparkles, VideoOff } from "lucide-react";
import { motion } from "framer-motion";
import { useSearch } from "../context/SearchContext";

const HeroSection = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);

  // Fetch a professional workplace video from Pexels API
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Note: In production, you should use your own Pexels API key
        // and make this request from your backend to keep the key secure
        const response = await fetch(
          "https://api.pexels.com/videos/search?query=office+work&per_page=1",
          {
            headers: {
              Authorization: "563492ad6f91700001000001a5e3b8f3b0a14c7b8b5f3b3c3e3b3f3b",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch video");

        const data = await response.json();
        if (data.videos && data.videos.length > 0) {
          // Get the HD quality video file
          const videoFile = data.videos[0].video_files.find(
            (file) => file.quality === "hd" || file.quality === "sd"
          );
          setVideoUrl(videoFile.link);
        } else {
          throw new Error("No videos found");
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        setVideoError(true);
        // Fallback to a default video
        setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-people-working-in-an-office-2382-large.mp4");
      } finally {
        setLoadingVideo(false);
      }
    };

    fetchVideo();
  }, []);

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const playVideo = async () => {
      try {
        videoRef.current.muted = true; // Required for autoplay in most browsers
        await videoRef.current.play();
      } catch (err) {
        console.log("Video play error:", err);
        setVideoError(true);
      }
    };

    if (videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
      playVideo();
    } else {
      videoRef.current.addEventListener('loadeddata', playVideo);
      return () => {
        videoRef.current?.removeEventListener('loadeddata', playVideo);
      };
    }
  }, [videoUrl]);

  return (
    <div className="relative bg-black text-white py-20 sm:py-28 overflow-hidden h-[90vh] min-h-[700px] flex items-center">
      {/* Video Background with fallbacks */}
      <div className="absolute inset-0 z-0">
        {!videoError && videoUrl ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
            onError={() => setVideoError(true)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-blue-900 opacity-70 flex items-center justify-center">
            <VideoOff className="h-20 w-20 text-gray-500" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
      </div>

      <div className="container mx-auto text-center px-2 sm:px-4 relative z-10">
        {loadingVideo && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
            <div className="animate-pulse text-gray-300">Loading...</div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6 sm:mb-8 text-xs sm:text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          <span>No.1 Job & Internship Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        >
          <span className="block">Search, Apply &</span>
          <span className="block mt-2 sm:mt-3">
            Land Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dream Role
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl mb-8 sm:mb-12 max-w-[95vw] sm:max-w-[700px] mx-auto text-gray-300"
        >
          Discover your perfect career opportunity from thousands of jobs and
          internships at top companies worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row w-full max-w-full sm:max-w-2xl mx-auto bg-gradient-to-r from-gray-900/70 to-gray-800/40 backdrop-blur-lg border border-gray-700 rounded-2xl sm:rounded-full items-center gap-2 p-1 shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
        >
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 sm:py-4 pl-4 sm:pl-6 pr-2 bg-transparent text-white placeholder-gray-400 border-none focus:ring-0 outline-none text-sm sm:text-base"
          />

          <Button
            size="lg"
            className="rounded-xl sm:rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 sm:px-8 py-4 sm:py-6 gap-2 transition-all hover:scale-[1.02] cursor-pointer w-full sm:w-auto text-base sm:text-lg shadow-lg hover:shadow-blue-500/30"
          >
            <Search className="h-5 w-5" />
            <span className="hidden xs:inline">Search</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-gray-300 text-sm sm:text-base"
        >
          <div className="flex items-center gap-2 justify-center bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <Rocket className="h-5 w-5 text-green-400" />
            <span>10,000+ Success Stories</span>
          </div>
          <div className="flex items-center gap-2 justify-center bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="text-xl sm:text-2xl">🚀</span>
            <span>50,000+ Opportunities</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;