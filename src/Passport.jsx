import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext";
import { useTranslation } from "react-i18next";
import { useData } from "./DataContext";
import TutorialModal from "./TutorialModal";

const style = document.createElement("style");
style.innerHTML = `
  @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 20% { transform: translateX(150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
  .animate-shimmer::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 6.7s infinite; }
`;
if (typeof document !== "undefined") document.head.appendChild(style);

const Passport = () => {
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  const isCJK = ["chi", "jap", "kor"].includes(currentLang);

  const [activeTab, setActiveTab] = useState("badges");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("origin");
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);

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
    setIsInfoExpanded(false);
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
          {t("Passport")}
        </h2>
        <div className="bg-[#4C7541] border border-[#6BB252] text-white text-[10px] px-3 py-1.5 rounded-full shadow-sm tracking-wider">
          {unlockedCount}/{totalCount} {t("unlocked")}
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
            {t("User Badges")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-serif rounded-t-xl text-[1.1rem] transition-colors duration-200 ${
              activeTab === "history"
                ? "bg-[#E0CCB6] text-[#5A3B22] z-20 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]"
                : "bg-[#C4AB8F] text-[#5A3B22]/70 z-10"
            }`}
          >
            {t("History")}
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
                
                <div
                  onClick={() => setShowTutorial(true)}
                  className="bg-white p-3.5 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors border border-[#E0CCB6]/50"
                >
                  <div className="w-[50px] h-[50px] bg-[#C4AB8F] rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 text-left">
                    <h3 className="font-serif text-[#381111] text-[18px] leading-tight mb-0.5">
                      {t("Instructions: How to play?")}
                    </h3>
                    <p className="font-serif text-[#783713] text-[14px] leading-tight opacity-90">
                      {t("A guide to ArtiFact NMFA")}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => navigate("/Certificate")}
                  className="bg-[#381111] p-3.5 rounded-2xl shadow-md flex items-center gap-4 cursor-pointer hover:brightness-110 transition-all border border-[#5A3B22]/30 active:scale-[0.98]"
                >
                  <div className="w-[50px] h-[50px] bg-[#E0CCB6] rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner relative p-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full text-[#381111] drop-shadow-sm"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                      <circle
                        cx="12"
                        cy="8"
                        r="5"
                        fill="#E19B2D"
                        className="text-[#381111]"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col flex-1 text-left">
                    <h3 className="font-serif text-[#E0CCB6] text-[18px] font-bold leading-tight mb-0.5">
                      {t("Digital Certificate")}
                    </h3>
                    <p className="font-serif text-[#E0CCB6]/70 text-[13px] leading-tight">
                      {t(
                        "Claim your official achievement for your participation and badges!",
                      )}
                    </p>
                  </div>
                </div>
                
                {unlockedHistory.length === 0 ? (
                  <p className="font-serif text-center text-[#9A7B5C] mt-4 italic text-lg">
                    {t("Scan paintings to start your history!")}
                  </p>
                ) : (
                  unlockedHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenArtwork(item)}
                      className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-[#D1C2B0] rounded-lg flex-shrink-0 overflow-hidden relative">
                        {item.thumbnail_url && (
                          <img
                            src={item.thumbnail_url}
                            alt="thumbnail"
                            className="w-full h-full object-cover scale-[1.03]"
                          />
                        )}
                      </div>

                      <div className="flex flex-col flex-1 text-left">
                        <h3
                          className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#1A0F0A] text-lg leading-tight mb-1`}
                        >
                          {item.title?.[currentLang] || item.title?.eng}
                        </h3>
                        <p className="font-serif text-[#783713] text-sm italic mb-1">
                          {item.artist?.[currentLang] || item.artist?.eng}{" "}
                          {item.artist_year ? `• ${item.artist_year}` : ""}
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
          <div
            className={`bg-[#E0CCB6] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative border border-[#C4AB8F] transition-all duration-300 ${
              isInfoExpanded ? "h-[90vh]" : ""
            }`}
          >
            <div className="bg-[#381111] py-4 px-6 flex justify-between items-center text-white font-serif shadow-sm">
              <span className="text-2xl">{t("About")}</span>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
              >
                ✕
              </button>
            </div>

            {!isInfoExpanded && (
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
                      {t("Image Unavailable")}
                    </span>
                  )
                ) : selectedArtwork.thumbnail_url ? (
                  <img
                    src={selectedArtwork.thumbnail_url}
                    alt="Artwork Thumbnail"
                    className="w-full h-full object-cover opacity-90 scale-[1.03]"
                  />
                ) : (
                  "img"
                )}
              </div>
            )}

            <h2
              className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-center text-[2.5rem] text-[#4A260F] mt-3 leading-none`}
            >
              {selectedArtwork.title?.[currentLang] ||
                selectedArtwork.title?.eng}
            </h2>
            <p className="text-center font-serif italic text-[#783713] text-sm mb-4">
              {selectedArtwork.artist?.[currentLang] ||
                selectedArtwork.artist?.eng}{" "}
              {selectedArtwork.artist_year
                ? `• ${selectedArtwork.artist_year}`
                : ""}
            </p>

            <div
              className={`mx-5 bg-[#F5EAD4] p-4 rounded-xl border border-[#E0CCB6] relative mb-4 transition-all duration-300
                  ${isInfoExpanded ? "h-[30rem]" : "h-48"}
                  ${isCJK ? "font-sans text-sm" : "font-neohellenic text-[15px]"}
                  text-[#4A260F]/80 border border-[#E0CCB6] text-justify
              `}
            >
              <button
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#783713] text-[#E0CCB6] hover:brightness-110 transition-all active:scale-100 flex items-center justify-center"
                title={isInfoExpanded ? t("Show Image") : t("Expand Reading")}
              >
                {isInfoExpanded ? "⛶" : "⛶"}
              </button>

              <div
                className={`h-full overflow-y-auto p-2 pr-8 ${
                  isCJK ? "font-sans text-sm" : "font-neohellenic text-[20px]"
                } text-[#4A260F]/80 text-justify hide-scrollbar`}
              >
                <div className="mb-2">
                  {typeof selectedArtwork[activeModalTab] === "object" &&
                  selectedArtwork[activeModalTab] !== null
                    ? selectedArtwork[activeModalTab][currentLang] ||
                      selectedArtwork[activeModalTab].eng
                    : selectedArtwork[activeModalTab] ||
                      t("More information coming soon...")}
                </div>

                {activeModalTab === "artist_description" && (
                  <div className="mt-5 pt-4 border-t border-[#C4AB8F]/50">
                    <h4 className="font-serif font-bold text-[#783713] mb-3 text-base text-left">
                      {t("Related Works")}
                    </h4>
                    <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                      {selectedArtwork.related_arts &&
                      selectedArtwork.related_arts.length > 0 ? (
                        selectedArtwork.related_arts.map((art, idx) => (
                          <div
                            key={idx}
                            className="w-24 shrink-0 flex flex-col gap-1"
                          >
                            <img
                              src={art.image_url}
                              alt={art.title}
                              className="w-24 h-24 object-cover rounded-lg border border-[#C4AB8F] shadow-sm"
                            />
                            <span className="text-xs font-serif leading-tight text-center truncate text-[#4A260F]">
                              {art.title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-[#783713]/60 w-full text-center">
                          {t("More works coming soon...")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mx-5 grid grid-cols-3 gap-3 mb-3">
              <button
                onClick={() => setActiveModalTab("origin")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "origin" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t("Origin")}
              </button>
              <button
                onClick={() => setActiveModalTab("artist_description")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "artist_description" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t("Artist")}
              </button>
              <button
                onClick={() => setActiveModalTab("art_element")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-[12px] transition-colors duration-150 active:scale-95 ${activeModalTab === "art_element" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t("Art Elements")}
              </button>
            </div>

            <div className="mx-5 mb-6 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
              <button
                onClick={() =>
                  navigate("/mini-game", {
                    state: { artwork: selectedArtwork },
                  })
                }
                className="w-full border border-[#783713] text-[#783713] hover:bg-[#783713] hover:text-[#E0CCB6] shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-95 font-serif rounded-xl py-2.5 text-lg flex items-center justify-center gap-2.5"
              >
                <svg viewBox="0 0 512 512" className="w-6 h-6">
                  <g>
                    <path
                      fill="currentColor"
                      d="M510.002,309.835l-0.068-0.326l-0.076-0.334l-26.508-112.721l-0.106-0.417l-0.106-0.418
                c-16.668-62.217-73.294-105.666-137.712-105.666H166.579c-64.418,0-121.045,43.449-137.712,105.666l-0.114,0.418l-0.099,0.417
                L2.147,309.174l-0.076,0.326l-0.068,0.326c-9.749,46.43,16.926,92.496,62.036,107.168l1.586,0.509
                c9.24,3.012,18.89,4.544,28.624,4.544c32.668,0,63.128-17.404,79.758-45.489l22.556-33.343l0.561-0.835l0.509-0.872
                c0.796-1.388,2.276-2.253,3.861-2.253h109.02c1.586,0,3.066,0.865,3.862,2.253l0.508,0.872l0.562,0.835l22.555,33.343
                c16.63,28.085,47.09,45.489,79.766,45.489c9.734,0,19.384-1.532,28.67-4.56l1.533-0.493
                C493.07,402.331,519.737,356.257,510.002,309.835z M439.318,390.397l-1.54,0.501c-6.608,2.154-13.353,3.186-20.014,3.186
                c-22.646,0-44.283-11.949-56.088-32.433l-23.064-34.101c-5.788-10.053-16.508-16.258-28.101-16.258h-109.02
                c-11.592,0-22.312,6.206-28.101,16.258l-23.063,34.101c-11.804,20.484-33.434,32.433-56.081,32.433
                c-6.661,0-13.405-1.032-20.013-3.186l-1.548-0.501c-31.431-10.219-50.102-42.485-43.311-74.819l26.508-112.722
                c13.42-50.102,58.826-84.94,110.696-84.94h178.847c51.869,0,97.276,34.838,110.696,84.94l26.508,112.722
                C489.413,347.912,470.75,380.178,439.318,390.397z"
                    />
                    <polygon
                      fill="currentColor"
                      points="157.453,172.061 123.912,172.061 123.912,210.579 85.387,210.579 85.387,244.105 123.912,244.105 
                123.912,282.637 157.453,282.637 157.453,244.105 195.978,244.105 195.978,210.579 157.453,210.579   "
                    />
                    <path
                      fill="currentColor"
                      d="M365.721,206.247c11.668,0,21.113-9.445,21.113-21.098c0-11.669-9.445-21.114-21.113-21.114
                c-11.653,0-21.098,9.445-21.098,21.114C344.622,196.802,354.068,206.247,365.721,206.247z"
                    />
                    <path
                      fill="currentColor"
                      d="M323.509,206.247c-11.653,0-21.106,9.453-21.106,21.098c0,11.669,9.453,21.122,21.106,21.122
                c11.661,0,21.106-9.453,21.106-21.122C344.615,215.7,335.17,206.247,323.509,206.247z"
                    />
                    <path
                      fill="currentColor"
                      d="M365.721,248.459c-11.653,0-21.098,9.445-21.098,21.114c0,11.653,9.445,21.098,21.098,21.098
                c11.668,0,21.113-9.445,21.113-21.098C386.834,257.904,377.388,248.459,365.721,248.459z"
                    />
                    <path
                      fill="currentColor"
                      d="M407.933,206.247c-11.653,0-21.099,9.453-21.099,21.098c0,11.669,9.446,21.122,21.099,21.122
                c11.66,0,21.113-9.453,21.113-21.122C429.046,215.7,419.593,206.247,407.933,206.247z"
                    />
                  </g>
                </svg>

                <span>{t("Mini-Game")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default Passport;
