import React from "react";
import { Button } from "./ui/button";
import { Search, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSearch } from "../context/SearchContext";

const HeroSection = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="relative bg-black text-white py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent"></div>
      </div>

      <div className="container mx-auto text-center px-2 sm:px-4 relative z-10">
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
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
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
          className="text-base sm:text-xl mb-8 sm:mb-12 max-w-[95vw] sm:max-w-[700px] mx-auto text-gray-300"
        >
          Discover your perfect career opportunity from thousands of jobs and
          internships at top companies worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row w-full max-w-full sm:max-w-2xl mx-auto bg-gradient-to-r from-gray-900/50 to-gray-800/20 backdrop-blur-lg border border-gray-700 rounded-2xl sm:rounded-full items-center gap-2 p-1 shadow-xl hover:shadow-blue-500/20 transition-shadow"
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
            className="rounded-xl sm:rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 sm:px-8 py-4 sm:py-6 gap-2 transition-transform hover:scale-105 cursor-pointer w-full sm:w-auto text-base sm:text-lg"
          >
            <Search className="h-5 w-5" />
            <span className="hidden xs:inline">Search</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-gray-300 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 justify-center">
            <Rocket className="h-5 w-5 text-green-400" />
            <span>10,000+ Success Stories</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xl sm:text-2xl">🚀</span>
            <span>50,000+ Opportunities</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
