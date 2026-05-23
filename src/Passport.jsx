import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext";
import { uiDict } from "./translations";
import { useData } from "./DataContext";

const style = document.createElement("style");
style.innerHTML = `
  @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 20% { transform: translateX(150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
  .animate-shimmer::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 6.7s infinite; }
`;
if (typeof document !== "undefined") document.head.appendChild(style);

const Passport = () => {
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;
  const isCJK = ["chi", "jap", "kor"].includes(currentLang);

  const [activeTab, setActiveTab] = useState("badges");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("origin");

  const { artworks, unlockedBadges, isDataLoading } = useData();

  const passportStamps = artworks.map((artwork) => {
    const unlockedBadge = unlockedBadges.find(
      (b) => b.artwork_id === artwork.id,
    );
    return {
      ...artwork,
      isUnlocked: !!unlockedBadge,
      badgeType: unlockedBadge ? unlockedBadge.badge_type || "Base" : null,
    };
  });

  const unlockedCount = passportStamps.filter((s) => s.isUnlocked).length;
  const totalCount = passportStamps.length || 10;
  const unlockedHistory = passportStamps.filter((s) => s.isUnlocked);

  const handleOpenArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    setActiveModalTab("origin");
  };

  const getBadgeStyles = (type) => {
    if (type === "Gold")
      return "bg-white border-[#E6BA39] shadow-[0_0_15px_rgba(230,186,57,0.5)] animate-shimmer";
    if (type === "Silver")
      return "bg-[#F3F4F6] border-[#C0C0C0] shadow-[0_0_10px_rgba(192,192,192,0.4)]";
    return "bg-[#FFF0E0] border-[#CD7F32] shadow-[0_0_8px_rgba(205,127,50,0.5)]";
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#946A42] overflow-hidden flex flex-col items-center pt-10 pb-[120px] font-neohellenic relative box-border">
      <div className="w-11/12 max-w-sm flex justify-between items-center mb-6 pl-2 flex-shrink-0">
        <h2 className="font-sans font-bold text-white text-3xl tracking-wide">
          {t.passport || "Passport"}
        </h2>
        <div className="bg-[#4C7541] border border-[#6BB252] text-white text-[10px] px-3 py-1.5 rounded-full shadow-sm tracking-wider">
          {unlockedCount}/{totalCount} {t.unlocked || "unlocked"}
        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 flex flex-col relative z-0 min-h-0">
        <div className="flex w-full mx-auto z-10 relative flex-shrink-0 px-3 gap-1">
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-3 font-serif rounded-t-xl text-[1.1rem] transition-colors duration-200 ${
              activeTab === "badges"
                ? "bg-[#E0CCB6] text-[#5A3B22] z-20 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]"
                : "bg-[#C4AB8F] text-[#5A3B22]/70 z-10"
            }`}
          >
            {t.yourBadges || "User Badges"}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-serif rounded-t-xl text-[1.1rem] transition-colors duration-200 ${
              activeTab === "history"
                ? "bg-[#E0CCB6] text-[#5A3B22] z-20 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]"
                : "bg-[#C4AB8F] text-[#5A3B22]/70 z-10"
            }`}
          >
            {t.history || "History"}
          </button>
        </div>

        <div className="bg-[#E0CCB6] flex-1 rounded-[1.5rem] p-6 shadow-2xl relative z-20 overflow-y-auto hide-scrollbar flex flex-col -mt-1">
          {isDataLoading ? (
            <div className="grid grid-cols-2 gap-y-10 justify-items-center mt-2 w-full overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className="w-[110px] h-[110px] rounded-full bg-[#D1C2B0]/70 border-[5px] border-[#C4AB8F]/50 animate-pulse mb-3 shadow-inner"></div>
                  <div className="w-20 h-4 bg-[#D1C2B0]/80 rounded-full animate-pulse mt-1"></div>
                </div>
              ))}
            </div>
          ) : activeTab === "badges" ? (
            <div className="grid grid-cols-2 gap-y-10 justify-items-center mt-2 pb-8">
              {passportStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => stamp.isUnlocked && handleOpenArtwork(stamp)}
                >
                  <div
                    style={{
                      transform: stamp.isUnlocked
                        ? `rotate(${((stamp.id * 137) % 15) - 7}deg)`
                        : "rotate(0deg)",
                    }}
                    className={`w-[110px] h-[110px] rounded-full border-[5px] flex items-center justify-center mb-3 overflow-hidden relative
                    ${!stamp.isUnlocked ? "bg-[#9A7B5C] border-[#70563C]" : getBadgeStyles(stamp.badgeType)}`}
                  >
                    {stamp.isUnlocked && stamp.badge_url ? (
                      <img
                        src={stamp.badge_url}
                        alt="Badge"
                        className="w-full h-full object-cover scale-[1.07] animate-fade-in"
                      />
                    ) : !stamp.isUnlocked ? (
                      <span className="text-[#70563C] text-4xl font-serif font-bold opacity-40">
                        ?
                      </span>
                    ) : null}
                  </div>

                  <p
                    className={`font-serif text-[15px] text-center leading-tight max-w-[100px] ${stamp.isUnlocked ? "text-[#8E431E]" : "text-[#A28464]"}`}
                  >
                    {stamp.isUnlocked
                      ? stamp.badge_name?.[currentLang] ||
                        stamp.badge_name?.eng ||
                        stamp.title?.[currentLang] ||
                        stamp.title?.eng
                      : "???"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col flex-1 relative">
              <div className="flex flex-col gap-4 mt-2 pb-6 overflow-y-auto hide-scrollbar">
                {unlockedHistory.length === 0 ? (
                  <p className="font-serif text-center text-[#9A7B5C] mt-4 italic text-lg">
                    {t.areaEmpty || "Scan paintings to start your history!"}
                  </p>
                ) : (
                  unlockedHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenArtwork(item)}
                      className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-[60px] h-[60px] bg-[#BBA58F] rounded-2xl flex-shrink-0 overflow-hidden border ${
                          item.badgeType === "Gold"
                            ? "border-[#E6BA39]"
                            : item.badgeType === "Silver"
                              ? "border-[#C0C0C0]"
                              : "border-[#CD7F32]"
                        }`}
                      >
                        {item.badge_url && (
                          <img
                            src={item.badge_url}
                            alt="thumbnail"
                            className="w-full h-full object-cover scale-[1.03]"
                          />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <h3
                          className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#1A0F0A] text-lg leading-none mb-1`}
                        >
                          {item.title?.[currentLang] || item.title?.eng}
                        </h3>
                        <p className="font-serif text-[#783713] text-sm italic mb-1">
                          {item.artist?.[currentLang] || item.artist?.eng} •
                          1884
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedArtwork && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#E0CCB6] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative border border-[#C4AB8F]">
            <div className="bg-[#381111] py-4 px-6 flex justify-between items-center text-white font-serif shadow-sm">
              <span className="text-2xl">About</span>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
              >
                ✕
              </button>
            </div>

            <div className="mx-5 mt-5 h-52 bg-[#D1C2B0] border border-[#BBA58F] flex items-center justify-center text-[#998670] font-serif text-3xl overflow-hidden rounded-lg relative">
              {activeModalTab === "artist_description" ? (
                selectedArtwork.artist_image_url ? (
                  <img
                    src={selectedArtwork.artist_image_url}
                    alt="Artist Photograph"
                    className="w-full h-full object-cover opacity-90 scale-[1.03]"
                  />
                ) : (
                  <span className="text-[#998670] text-sm font-serif italic">
                    Image Unavailable
                  </span>
                )
              ) : selectedArtwork.badge_url ? (
                <img
                  src={selectedArtwork.badge_url}
                  alt="Artwork Badge"
                  className="w-full h-full object-cover opacity-90 scale-[1.03]"
                />
              ) : (
                "img"
              )}
            </div>

            <h2
              className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-center text-[2.5rem] text-[#4A260F] mt-3 leading-none`}
            >
              {selectedArtwork.title?.[currentLang] ||
                selectedArtwork.title?.eng}
            </h2>
            <p className="text-center font-serif italic text-[#783713] text-sm mb-4">
              {selectedArtwork.artist?.[currentLang] ||
                selectedArtwork.artist?.eng}{" "}
              • 1884
            </p>

            <div className="mx-5 grid grid-cols-3 gap-3 mb-3">
              <button
                onClick={() => setActiveModalTab("origin")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "origin" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.origin || "Origin"}
              </button>
              <button
                onClick={() => setActiveModalTab("artist_description")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "artist_description" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.artist || "Artist"}
              </button>
              <button
                onClick={() => setActiveModalTab("art_element")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-[12px] transition-colors duration-150 active:scale-95 ${activeModalTab === "art_element" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.elements || "Art Elements"}
              </button>
            </div>

            <div
              className={`mx-5 bg-[#F5EAD4] p-4 rounded-xl h-36 overflow-y-auto hide-scrollbar mb-4 ${isCJK ? "font-sans text-sm" : "font-neohellenic text-[15px]"} text-[#4A260F]/80 border border-[#E0CCB6] text-justify`}
            >
              {typeof selectedArtwork[activeModalTab] === "object" &&
              selectedArtwork[activeModalTab] !== null
                ? selectedArtwork[activeModalTab][currentLang] ||
                  selectedArtwork[activeModalTab].eng
                : selectedArtwork[activeModalTab] ||
                  "More information coming soon..."}
            </div>

            <div className="mx-5 mb-6">
              <button
                onClick={() =>
                  navigate("/quiz", { state: { artwork: selectedArtwork } })
                }
                className="w-full border border-[#783713] text-[#783713] hover:bg-[#783713] hover:text-[#E0CCB6] shadow-[0_8px_20px_rgba(0,0,0,0.3)] pointer-events-none top-1/2 origin-center transition-all duration-150 active:scale-95 font-serif rounded-xl py-2.5 text-lg"
              >
                Take Quiz?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passport;
