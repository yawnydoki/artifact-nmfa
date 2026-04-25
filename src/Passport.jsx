import React, { useState } from "react";

const Passport = () => {
  // States for Tabs and Modal
  const [activeTab, setActiveTab] = useState("badges");
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  // Mock Data for Badges
  const badges = [
    { id: 1, title: "Welcom Badge", unlocked: true, type: "gold" },
    { id: 2, title: "The Fallen Galea", unlocked: true, type: "silver" },
    { id: 3, title: "???", unlocked: false },
    { id: 4, title: "???", unlocked: false },
    { id: 5, title: "???", unlocked: false },
    { id: 6, title: "???", unlocked: false },
  ];

  // Mock Data for History
  const history = [
    { id: 1, title: "Spoliarium", artist: "Juan Luna", date: "Oct 24, 2025" },
    {
      id: 2,
      title: "The Parisian Life",
      artist: "Juan Luna",
      date: "Oct 24, 2025",
    },
  ];

  return (
    <div className="h-screen w-screen bg-artifact-passport overflow-hidden flex flex-col items-center pt-10 pb-24 font-hind relative">
      {/* Header */}
      <div className="w-11/12 max-w-sm flex justify-between items-center mb-6 pl-2">
        <h2 className="font-daruma text-white text-3xl tracking-wide">
          Passport
        </h2>
        <div className="bg-green-700/80 border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm uppercase tracking-wider">
          Auto-Saved
        </div>
      </div>

      {/* --- TABS & MAIN CARD --- */}
      <div className="w-11/12 max-w-sm flex-1 flex flex-col relative z-0">
        {/* Tab Buttons */}
        <div className="flex w-[90%] mx-auto z-10 relative top-2">
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-3 font-daruma rounded-t-2xl text-lg transition-colors duration-200 ${
              activeTab === "badges"
                ? "bg-artifact-tab text-white z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#9C7042] text-white/70 z-10"
            }`}
          >
            Your Badges
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-daruma rounded-t-2xl text-lg transition-colors duration-200 ${
              activeTab === "history"
                ? "bg-artifact-tab text-white z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#9C7042] text-white/70 z-10"
            }`}
          >
            History
          </button>
        </div>

        {/* Content Area (Beige Card) */}
        <div className="bg-artifact-card flex-1 rounded-3xl p-6 shadow-2xl border-b-8 border-[#C9B99A] relative z-20 overflow-y-auto hide-scrollbar">
          {activeTab === "badges" ? (
            /* Badges Grid View */
            <div className="grid grid-cols-2 gap-6 justify-items-center mt-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() =>
                    badge.unlocked && setSelectedArtwork(history[0])
                  }
                >
                  <div
                    className={`w-24 h-24 rounded-full border-4 shadow-md flex items-center justify-center mb-2 transition-transform hover:scale-105
                    ${
                      !badge.unlocked
                        ? "bg-[#9C7042] border-[#8A6136]"
                        : badge.type === "gold"
                          ? "bg-white border-artifact-gold"
                          : "bg-white border-gray-400"
                    }`}
                  >
                    {badge.unlocked && (
                      <div className="w-16 h-16 rounded-full bg-gray-100"></div>
                    )}
                  </div>
                  <p
                    className={`font-daruma text-sm text-center leading-tight ${badge.unlocked ? "text-artifact-border" : "text-[#9C7042]"}`}
                  >
                    {badge.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* History List View */
            <div className="flex flex-col gap-4 mt-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedArtwork(item)}
                  className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#C9B99A] flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div>
                    <h3 className="font-daruma text-artifact-border text-xl">
                      {item.title}
                    </h3>
                    <p className="text-artifact-border/70 text-xs font-bold">
                      Scanned: {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- DETAILED ARTWORK MODAL (SLIDE UP) --- */}
      {selectedArtwork && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-artifact-passport w-full h-[85%] rounded-t-[40px] p-4 flex flex-col items-center relative border-t-4 border-artifact-card">
            {/* Close Button */}
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-6 right-6 w-8 h-8 bg-artifact-card rounded-full text-artifact-border font-bold shadow-md hover:bg-white"
            >
              ✕
            </button>

            {/* Modal Inner Content */}
            <div className="w-11/12 max-w-sm mt-12 bg-artifact-card flex-1 rounded-3xl p-5 border-b-8 border-[#C9B99A] shadow-xl flex flex-col">
              {/* Image Placeholder */}
              <div className="w-full h-48 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-500 font-bold border-2 border-artifact-border/20">
                Img
              </div>

              {/* Text Info */}
              <h2 className="font-daruma text-artifact-border text-3xl mb-1">
                {selectedArtwork.title}
              </h2>
              <p className="text-artifact-border font-bold text-sm mb-4">
                by {selectedArtwork.artist}
              </p>

              <p className="text-artifact-border/80 text-xs mb-6 flex-1 overflow-y-auto pr-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button className="bg-artifact-border text-artifact-card rounded-full py-2 font-daruma text-sm hover:opacity-90 transition-opacity">
                  Details
                </button>
                <button className="bg-transparent border-2 border-artifact-border text-artifact-border rounded-full py-2 font-daruma text-sm hover:bg-gray-100 transition-colors">
                  Artist
                </button>
                <button className="bg-transparent border-2 border-artifact-border text-artifact-border rounded-full py-2 font-daruma text-sm hover:bg-gray-100 transition-colors">
                  Elements
                </button>
              </div>
              <button className="w-full bg-artifact-gold text-artifact-border rounded-full py-3 font-daruma text-lg tracking-wider shadow-md hover:brightness-110 transition-all">
                Read More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passport;
