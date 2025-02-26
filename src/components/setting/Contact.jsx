"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ContactSupport = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/employees/support", { subject, message });
      alert("Message sent to support!");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-xl shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
      <div className="space-y-6">
        <div>
          <p><strong>Email:</strong> support@company.com</p>
          <p><strong>Phone:</strong> +251-911-123-4567</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded h-32"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Send Message
          </motion.button>
        </form>
        <p><a href="/docs/attendance-guide.pdf" className="text-indigo-600">User Manual</a></p>
      </div>
    </motion.div>
  );
};

export default ContactSupport;