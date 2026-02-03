import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-20 h-20 rounded-full border-t-4 border-indigo-600 border-r-4 border-r-transparent"
        />

        {/* Inner Pulsing Core */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200"
        />
        
        {/* Decorative Floating Particles */}
        <motion.div 
          animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
          className="absolute -top-4 -right-2 w-2 h-2 bg-purple-400 rounded-full"
        />
      </div>

      {/* Modern Text with Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col items-center"
      >
        <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-900">
          USCMS
        </span>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs font-bold text-gray-400">Syncing Campus Data</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
            className="w-1 h-1 bg-indigo-600 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Loader;