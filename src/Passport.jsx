import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import { uiDict } from "./translations";

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
    <div className="h-[100dvh] w-screen bg-artifact-passport overflow-hidden flex flex-col items-center pt-10 pb-[100px] font-hind relative box-border">
      
      <div className="w-11/12 max-w-sm flex justify-between items-center mb-6 pl-2 flex-shrink-0">
        <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-white text-3xl tracking-wide`}>
          {t.passport}
        </h2>
        <div className="bg-green-700/80 border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm uppercase tracking-wider">
          {unlockedCount}/{totalCount} {t.unlocked}
        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 flex flex-col relative z-0 min-h-0">
        
        <div className="flex w-[90%] mx-auto z-10 relative top-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-3 font-daruma rounded-t-2xl text-lg transition-colors duration-200 ${
              activeTab === "badges"
                ? "bg-artifact-tab text-white z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#9C7042] text-white/70 z-10"
            }`}
          >
            {t.yourBadges}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-daruma rounded-t-2xl text-lg transition-colors duration-200 ${
              activeTab === "history"
                ? "bg-artifact-tab text-white z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#9C7042] text-white/70 z-10"
            }`}
          >
            {t.history}
          </button>
        </div>

        <div className="bg-artifact-card flex-1 rounded-3xl p-6 shadow-2xl border-b-8 border-[#C9B99A] relative z-20 overflow-y-auto hide-scrollbar">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <p className="font-daruma text-artifact-border animate-pulse text-lg">{t.loading || "Loading..."}</p>
            </div>
          ) : activeTab === "badges" ? (
          
            <div className="grid grid-cols-2 gap-6 justify-items-center mt-4 pb-8">
              {passportStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => stamp.isUnlocked && handleOpenArtwork(stamp)}
                >
                  <div
                    className={`w-24 h-24 rounded-full border-4 shadow-md flex items-center justify-center mb-2 transition-transform hover:scale-105
                    ${
                      !stamp.isUnlocked
                        ? "bg-[#9C7042] border-[#8A6136]"
                        : stamp.badgeType === "Gold"
                        ? "bg-white border-artifact-gold"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {stamp.isUnlocked && (
                      <div className="w-16 h-16 rounded-full bg-gray-100"></div>
                    )}
                  </div>
                  <p
                    className={`font-daruma text-sm text-center leading-tight ${
                      stamp.isUnlocked ? "text-artifact-border" : "text-[#9C7042]"
                    }`}
                  >
                    {stamp.isUnlocked ? (stamp.title?.[currentLang] || stamp.title?.eng) : "???"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
       
            <div className="flex flex-col gap-4 mt-2 pb-8">
              {unlockedHistory.length === 0 ? (
                <p className="font-hind text-center text-artifact-border/70 mt-4">
                  Scan paintings to start your history!
                </p>
              ) : (
                unlockedHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenArtwork(item)}
                    className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#C9B99A] flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div>
                      <h3 className="font-daruma text-artifact-border text-xl">
                        {item.title?.[currentLang] || item.title?.eng}
                      </h3>
                      <p className="text-artifact-border/70 text-xs font-bold">
                        Scanned: {item.unlockDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedArtwork && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-artifact-passport w-full h-[85%] rounded-t-[40px] p-4 flex flex-col items-center relative border-t-4 border-artifact-card pb-[100px]">
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-6 right-6 w-8 h-8 bg-artifact-card rounded-full text-artifact-border font-bold shadow-md hover:bg-white z-10"
            >
              ✕
            </button>

            <div className="w-11/12 max-w-sm mt-12 bg-artifact-card flex-1 rounded-3xl p-5 border-b-8 border-[#C9B99A] shadow-xl flex flex-col overflow-hidden">
              <div className="w-full h-48 flex-shrink-0 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-500 font-bold border-2 border-artifact-border/20">
                Img
              </div>

              <h2 className="font-daruma text-artifact-border text-3xl mb-1 flex-shrink-0">
                {selectedArtwork.title?.[currentLang] || selectedArtwork.title?.eng}
              </h2>
              
              <p className="text-artifact-border font-bold text-sm mb-4 flex-shrink-0">
                by {selectedArtwork.artist?.[currentLang] || selectedArtwork.artist?.eng}
              </p>

              <div className={`text-artifact-border/80 text-sm mb-6 flex-1 overflow-y-auto pr-2 bg-white/40 p-3 rounded-xl border border-[#C9B99A] ${isCJK ? 'font-sans leading-relaxed' : 'font-hind'}`}>
                {selectedArtwork[activeModalTab]?.[currentLang] || selectedArtwork[activeModalTab]?.eng || "More information coming soon..."}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 flex-shrink-0">
                <button 
                  onClick={() => setActiveModalTab("origin")}
                  className={`rounded-full py-2 font-daruma text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "origin" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.origin}
                </button>
                <button 
                  onClick={() => setActiveModalTab("artist")}
                  className={`rounded-full py-2 font-daruma text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "artist" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.artist}
                </button>
                <button 
                  onClick={() => setActiveModalTab("art_element")}
                  className={`rounded-full py-2 font-daruma text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "art_element" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.elements}
                </button>
              </div>

              <button 
                onClick={() => navigate('/quiz', { state: { artwork: selectedArtwork } })}
                className={`w-full flex-shrink-0 bg-artifact-gold text-artifact-border rounded-full py-3 ${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-lg tracking-wider shadow-md hover:brightness-110 transition-all`}>
                {t.startQuiz}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passport;