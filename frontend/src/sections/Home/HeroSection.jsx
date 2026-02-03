import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import one from "../../images/one.jpg";
import two from "../../images/two.jpg";
import three from "../../images/three.jpg";

const slides = [
  {
    id: 1,
    title: "Welcome to USCMS",
    desc: "Your hub for university events and student engagement",
    img: one,
    cta: "Get Started",
  },
  {
    id: 2,
    title: "Join Societies",
    desc: "Explore and connect with passionate communities",
    img: two,
    cta: "Explore Societies",
  },
  {
    id: 3,
    title: "Attend Events",
    desc: "Never miss out on exciting campus events and activities",
    img: three,
    cta: "View Events",
  },
];

const SLIDE_DURATION = 6000;

function HeroSlider() {
  const [index, setIndex] = useState(0);

  // Auto slide (never pauses)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full min-h-svh flex items-center overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent z-10" />

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          className="absolute w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.img
            src={slides[index].img}
            alt={slides[index].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-white text-sm">
                University Society & Event Management
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {slides[index].title}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8">
              {slides[index].desc}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-linear-to-r from-[#331E86] to-[#27005D] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition">
                {slides[index].cta}
              </button>

              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                ["50+", "Active Societies"],
                ["200+", "Events Annually"],
                ["5000+", "Active Members"],
              ].map(([num, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                    {num}
                  </div>
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bars */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 md:px-12 pb-6">
        <div className="max-w-7xl mx-auto flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: i === index ? "100%" : "0%" }}
                transition={{
                  duration: i === index ? SLIDE_DURATION / 1000 : 0.3,
                  ease: "linear",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroSlider;
