import React from "react";
const Swagimg = "/Swagimg.jpg";

// Place a club logo at /src/assets/swag-logo.png or change the imageUrl below to an online image.
const imageUrl = "/assets/swag-logo.png"; // <-- replace with your club logo or an Unsplash URL

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Image + badge */}
          <div className="flex-shrink-0 text-center">
            <div className="relative inline-block">
              {/* Outer glow / ring */}
              <div className="rounded-full p-1 bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500 shadow-xl">
                <div className="rounded-full bg-white p-1">
                  <img
                    src={imageUrl}
                    alt="SWAG Club Logo"
                    onError={(e) => {
                      // fallback to a public image if local asset missing
                      e.currentTarget.src =
                        Swagimg;
                    }}
                    className="w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-full shadow-md"
                  />
                </div>
              </div>

              {/* Little ribbon badge */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  SWAG Club
                </div>
              </div>
            </div>

            {/* tagline under image for small screens */}
            <p className="mt-4 text-sm text-gray-600">Students With A Goal — Creativity • Events • Community</p>
          </div>

          {/* Right: Text and CTA */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600">SWAG</span> — SGGS WEB APP & GRAPHICS
            </h1>

            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              Join workshops, host campus events, build projects, and connect with fellow students. Register or log in to participate in upcoming meetups and competitions.
            </p>

          

            {/* Feature chips */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold">Workshops</h3>
                <p className="text-xs text-gray-500 mt-1">Hands-on sessions for coding, design, and robotics.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold">Competitions</h3>
                <p className="text-xs text-gray-500 mt-1">Hackathons and inter-college fests to show your talent.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold">Community</h3>
                <p className="text-xs text-gray-500 mt-1">Meet peers, build teams, and collaborate on ideas.</p>
              </div>
            </div>

            {/* Decorative footer */}
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
              </svg>
              <span>Empowering students since 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
