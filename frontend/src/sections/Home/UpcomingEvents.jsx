import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowUpRight, Clock } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Science Society Workshop",
    date: "Jan 20, 2026",
    time: "10:00 AM",
    location: "Main Lab 04",
    category: "Workshop",
    description: "Hands-on workshop on robotics and AI hosted by the Science Society.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "Cultural Fest 2026",
    date: "Feb 05, 2026",
    time: "05:00 PM",
    location: "University Auditorium",
    category: "Festival",
    description: "A week-long celebration of music, dance, and art by the Arts Club.",
    image: "https://images.unsplash.com/photo-1514525253344-f814d074e015?auto=format&fit=crop&q=80&w=800",
    color: "bg-purple-600",
  },
  {
    id: 3,
    title: "Tech Talk Series",
    date: "Feb 15, 2026",
    time: "02:30 PM",
    location: "IT Block Seminar Hall",
    category: "Seminar",
    description: "Guest lectures on the latest tech trends organized by the IT Society.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
    color: "bg-indigo-600",
  },
];

const UpcomingEvents = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-gray-900 tracking-tight mb-4"
            >
              Experience <span className="text-indigo-600">Campus Life</span>
            </motion.h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Don't miss out on the latest workshops, festivals, and talks. Join your peers and grow your network.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            View All Events <ArrowUpRight size={18} />
          </motion.button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-4xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${event.color} shadow-lg`}>
                    {event.category}
                  </span>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Register Now
                  </button>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-8 flex flex-col grow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold">
                    <CalendarDays size={16} />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Clock size={16} />
                    {event.time}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 grow">
                  {event.description}
                </p>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} className="text-red-400" />
                    <span className="text-xs font-medium uppercase tracking-wide">{event.location}</span>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm hover:underline underline-offset-4">
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;