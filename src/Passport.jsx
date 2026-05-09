import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import { uiDict } from "./translations";

const style = document.createElement('style');
style.innerHTML = `
  @keyframes shimmer {
    0% { transform: translateX(-150%) skewX(-20deg); }
    20% { transform: translateX(150%) skewX(-20deg); } /* change [number]% to a number to change speed of the shimmer*/
    100% { transform: translateX(150%) skewX(-20deg); }
  }
  .animate-shimmer::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: shimmer 6.7s infinite; /* change second to change interval time of shimmer */
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

const Passport = () => {
  const navigate = useNavigate();
  
  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;
  const isCJK = ['chi', 'jap', 'kor'].includes(currentLang);

  const [activeTab, setActiveTab] = useState("badges");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("clues"); 

  const [passportStamps, setPassportStamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPassportData = async () => {
      const visitorId = localStorage.getItem("artifact_visitor_id");
      if (!visitorId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: artworksData, error: artworksError } = await supabase
          .from("artworks")
          .select("*")
          .order("id", { ascending: true });
          
        if (artworksError) throw artworksError;

        const { data: badgesData, error: badgesError } = await supabase
          .from("unlocked_badges")
          .select("artwork_id, badge_type, created_at")
          .eq("visitor_id", visitorId);
          
        if (badgesError) throw badgesError;

        const mergedData = artworksData.map((artwork) => {
          const unlockedBadge = badgesData.find((b) => b.artwork_id === artwork.id);
          return {
            ...artwork,
            isUnlocked: !!unlockedBadge,
            badgeType: unlockedBadge ? unlockedBadge.badge_type : null,
            unlockDate: unlockedBadge ? new Date(unlockedBadge.created_at).toLocaleDateString() : null
          };
        });

        setPassportStamps(mergedData);
      } catch (error) {
        console.error("Error fetching passport data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPassportData();
  }, []);

  const unlockedCount = passportStamps.filter((s) => s.isUnlocked).length;
  const totalCount = passportStamps.length || 10;
  const unlockedHistory = passportStamps.filter((s) => s.isUnlocked);

  const handleOpenArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    setActiveModalTab("clues"); 
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
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <p className="font-serif text-[#5A3B22] animate-pulse text-lg">{t.loading || "Loading..."}</p>
            </div>
          ) : activeTab === "badges" ? (
          
            <div className="grid grid-cols-2 gap-y-10 justify-items-center mt-2 pb-8">
              {passportStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => stamp.isUnlocked && handleOpenArtwork(stamp)}
                >
                  <div
                    className={`w-[110px] h-[110px] rounded-full border-[5px] flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-105 shadow-md overflow-hidden relative
                    ${
                      !stamp.isUnlocked
                        ? "bg-[#9A7B5C] border-[#70563C]"
                        : "bg-white border-[#F2C94C] animate-shimmer" 
                    }`}
                  >
                    {stamp.isUnlocked && stamp.badge_url ? (
                      <img 
                        src={stamp.badge_url} 
                        alt="Badge" 
                        className="w-full h-full object-cover animate-fade-in"
                      />
                    ) : !stamp.isUnlocked ? (
                      <span className="text-[#70563C] text-4xl font-serif font-bold opacity-40">?</span>
                    ) : null}
                  </div>
                  
                  <p className={`font-serif text-[15px] text-center leading-tight max-w-[100px] ${stamp.isUnlocked ? "text-[#8E431E]" : "text-[#A28464]"}`}>
                    {stamp.isUnlocked 
                      ? (stamp.badge_name?.[currentLang] || stamp.badge_name?.eng || stamp.title?.[currentLang] || stamp.title?.eng) 
                      : "???"}
                  </p>
                </div>
              ))}
            </div>
            
          ) : (
            
            <div className="flex flex-col flex-1 relative">
              <div className="flex flex-col gap-4 mt-2 pb-16 overflow-y-auto hide-scrollbar">
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
                      <div className="w-[60px] h-[60px] bg-[#BBA58F] rounded-2xl flex-shrink-0 overflow-hidden border border-[#E0CCB6]">
                        {item.badge_url && (
                          <img src={item.badge_url} alt="thumbnail" className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-[#1A0F0A] text-lg leading-none mb-1`}>
                          {item.title?.[currentLang] || item.title?.eng}
                        </h3>
                        <p className="font-serif text-[#783713] text-sm italic">
                          {item.artist?.[currentLang] || item.artist?.eng} • 1884
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 pt-4 bg-[#E0CCB6]">
                <button className="bg-[#381111] text-white font-serif text-[1.1rem] px-6 py-2 rounded-xl shadow-md transition-all duration-150 active:scale-95">
                  Save Data
                </button>
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
              <button onClick={() => setSelectedArtwork(null)} className="text-xl opacity-80 hover:opacity-100 transition-opacity">
                [x]
              </button>
            </div>

            <div className="mx-5 mt-5 h-52 bg-[#D1C2B0] border border-[#BBA58F] flex items-center justify-center text-[#998670] font-serif text-3xl overflow-hidden rounded-lg">
               {selectedArtwork.badge_url ? (
                  <img src={selectedArtwork.badge_url} alt="Artwork" className="w-full h-full object-cover opacity-80" />
               ) : (
                 "img"
               )}
            </div>

            <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-center text-[2.5rem] text-[#4A260F] mt-3 leading-none`}>
              {selectedArtwork.title?.[currentLang] || selectedArtwork.title?.eng}
            </h2>
            <p className="text-center font-serif italic text-[#783713] text-sm mb-4">
              {selectedArtwork.artist?.[currentLang] || selectedArtwork.artist?.eng} • 1884
            </p>

            <div className={`mx-5 bg-[#F5EAD4] p-4 rounded-xl h-36 overflow-y-auto hide-scrollbar mb-4 ${isCJK ? 'font-sans text-sm' : 'font-neohellenic text-[15px]'} text-[#4A260F]/80 border border-[#E0CCB6]`}>
              {typeof selectedArtwork[activeModalTab] === 'object' && selectedArtwork[activeModalTab] !== null
                ? selectedArtwork[activeModalTab][currentLang] || selectedArtwork[activeModalTab].eng
                : selectedArtwork[activeModalTab] || "More information coming soon..."}
            </div>

            <div className="mx-5 grid grid-cols-3 gap-3 mb-3">
              <button 
                onClick={() => setActiveModalTab("origin")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "origin" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.origin || "Origin"}
              </button>
              <button 
                onClick={() => setActiveModalTab("artist")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors duration-150 active:scale-95 ${activeModalTab === "artist" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
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

            <div className="mx-5 mb-6">
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: selectedArtwork } })}
                className="w-full border border-[#783713] text-[#783713] hover:bg-[#783713] hover:text-[#E0CCB6] transition-all duration-150 active:scale-95 font-serif rounded-xl py-2.5 text-lg"
              >
                {t.startQuiz || "Start Quiz"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Passport;