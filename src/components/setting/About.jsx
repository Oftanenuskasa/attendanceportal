"use client";

import { motion } from "framer-motion";
import { Info, Calendar, Users, Code,UserCheck } from "lucide-react";

const About = () => {
  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl max-w-2xl mx-auto mt-12"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Info className="w-8 h-8 mr-3 text-indigo-600" /> About Attendance
          Portal
        </h2>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
          v1.0
        </span>
      </div>

      <div className="space-y-6">
        {/* Version */}
        <motion.div
          variants={itemVariants}
          className="flex items-start space-x-4"
        >
          <Code className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <p className="text-lg font-semibold text-gray-700">Version</p>
            <p className="text-gray-600">Attendance Portal v1.0</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-start space-x-4"
        >
          <Users className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <p className="text-lg font-semibold text-gray-700">Developed By</p>
            <p className="text-gray-600">TD(Software Engineer)</p>
          </div>
        </motion.div>

        {/* Purpose */}
        <motion.div
          variants={itemVariants}
          className="flex items-start space-x-4"
        >
          <UserCheck className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <p className="text-lg font-semibold text-gray-700">Purpose</p>
            <p className="text-gray-600">
              Streamline employee attendance tracking 
            </p>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          variants={itemVariants}
          className="flex items-start space-x-4"
        >
          <Calendar className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <p className="text-lg font-semibold text-gray-700">Last Updated</p>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Interactive Learn More Button */}
      <motion.div
        className="mt-8 text-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <a
          href="/docs/attendance-guide.pdf" // Replace with actual link or route
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Learn More
        </a>
      </motion.div>
    </motion.div>
  );
};

export default About;
