import React from "react";
import one from '../../images/one.jpg'

function Events() {
    return (
        <div className="w-full bg-linear-to-r from-[#e1d5f5] via-[#d2c8dd] to-[#2A0A5E] px-6 md:px-16 py-16">



            {/* Section Heading */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Upcoming Events
                </h2>
                <p className="text-white mt-2">
                    Stay updated with the latest activities happening at USCMS
                </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

                {/* CARD 1 */}
                <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition  border ">
                    <div className="h-48 w-full overflow-hidden">
                        <img src={one} alt="Sports Gala 2025" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#5B0BB5]">
                            Freshers Welcome Party
                        </h3>
                        <p className="text-black mt-2 mb-3">
                            A night of fun, music, and interaction with new students.
                        </p>
                        <button className="px-4 py-2 bg-[#5B0BB5] cursor-pointer text-white rounded-md hover:bg-[#1c0042] transition">
                            View Details
                        </button>
                    </div>
                </div>

                {/* CARD 2 */}
                <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-transform border ">
                    {/* Image */}
                    <div className="h-48 w-full overflow-hidden">
                        <img src={one} alt="Sports Gala 2025" className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#5B0BB5] mb-2">
                            Sports Gala 2025
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Compete, cheer, and celebrate teamwork and sportsmanship.
                        </p>
                        <button className="px-4 py-2 bg-[#5B0BB5] text-white rounded-md hover:bg-[#1c0042] transition">
                            View Details
                        </button>
                    </div>
                </div>


                {/* CARD 3 */}
                <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition  border ">
                    <div className="h-48 w-full overflow-hidden">
                        <img src={one} alt="Sports Gala 2025" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#5B0BB5]">
                            Tech Innovators Meetup
                        </h3>
                        <p className="text-black mt-2 mb-3">
                            A gathering of tech enthusiasts showcasing innovation.
                        </p>
                        <button className="px-4 py-2 bg-[#5B0BB5] cursor-pointer text-white rounded-md hover:bg-[#1c0042] transition">
                            View Details
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Events;
