import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import one from "../../images/one.jpg";
import two from "../../images/two.jpg";
import three from "../../images/three.jpg";

const slides = [
  {
    id: 1,
    title: "Build your campus impact",
    desc: "Discover societies, events, and leadership opportunities in one modern student platform.",
    img: one,
    primaryCta: { label: "Explore Societies", to: "/community" },
    secondaryCta: { label: "View Events", to: "/events" },
  },
  {
    id: 2,
    title: "Join vibrant communities",
    desc: "Connect with like-minded students, participate in activities, and grow through collaboration.",
    img: two,
    primaryCta: { label: "Browse Societies", to: "/community" },
    secondaryCta: { label: "Latest Posts", to: "/society-posts" },
  },
  {
    id: 3,
    title: "Never miss key events",
    desc: "Track workshops, elections, and society activities with a smooth, centralized experience.",
    img: three,
    primaryCta: { label: "Open Events", to: "/events" },
    secondaryCta: { label: "Election Hub", to: "/applyForElections" },
  },
];

const SLIDE_DURATION = 8000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goToSlide = (i) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
    startTimer();
  };

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#0f172a] md:min-h-[76vh]">
      <AnimatePresence custom={direction} initial={false} mode="sync">
        <motion.div
          key={slides[index].id}
          custom={direction}
          className="absolute inset-0"
          initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.25 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.25 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <img src={slides[index].img} alt={slides[index].title} className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/92 via-[#0f172a]/75 to-[#0f172a]/30" />

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-12 md:min-h-[76vh]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <span className="mb-4 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/90">
              University Societies & Clubs Management
            </span>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              {slides[index].title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{slides[index].desc}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={slides[index].primaryCta.to}
                className="rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1d4ed8]"
              >
                {slides[index].primaryCta.label}
              </Link>
              <Link
                to={slides[index].secondaryCta.to}
                className="rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0f172a]"
              >
                {slides[index].secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6">
        <div className="mx-auto flex max-w-6xl gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === index ? (
                <motion.div
                  className="h-full bg-[#38bdf8]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              ) : (
                <div className="h-full bg-white/35" style={{ width: i < index ? "100%" : "0%" }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}