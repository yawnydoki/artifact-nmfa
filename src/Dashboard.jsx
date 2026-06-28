import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import ArScanner from "./ArScanner";
import ArErrorBoundary from "./ArErrorBoundary"; 
import { useLanguage } from "./LanguageContext";
import { useTranslation } from "react-i18next";
import { useData } from "./DataContext";
import { supabase } from "./supabaseClient.js";

const style = document.createElement("style");
style.innerHTML = `
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  .animate-ticker {
    display: inline-block;
    white-space: nowrap;
    padding-left: 100%;
    animation: ticker 7s linear infinite;
  }
`;
if (typeof document !== "undefined") document.head.appendChild(style);

const Dashboard = () => {
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  const isCJK = ["chi", "jap", "kor"].includes(currentLang);

  const { artworks, unlockedBadges, refreshBadges } = useData();

  const [paintingDetected, setPaintingDetected] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const [isTracking, setIsTracking] = useState(false);
  const [isScanningSequence, setIsScanningSequence] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [pendingTargetIndex, setPendingTargetIndex] = useState(null);
  const [showTapToScanBtn, setShowTapToScanBtn] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("origin");
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [showNotScannableHint, setShowNotScannableHint] = useState(false);

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const [badgeOverlay, setBadgeOverlay] = useState(null);

  const animationRef = useRef(null);

  const isFetchingRef = useRef(false);
  const isScanningSequenceRef = useRef(false);
  const activeArtworkRef = useRef(null);

  const artworkMap = useMemo(() => {
    const map = new Map();
    artworks.forEach((a) => map.set(a.target_index, a));
    return map;
  }, [artworks]);

  const unlockedSet = useMemo(() => {
    return new Set(unlockedBadges.map((b) => b.artwork_id));
  }, [unlockedBadges]);

  const unlockedByIndex = useMemo(() => {
    const arr = Array(10).fill(false);
    artworks.forEach((a) => {
      if (unlockedSet.has(a.id)) {
        arr[a.target_index] = true;
      }
    });
    return arr;
  }, [artworks, unlockedSet]);

  useEffect(() => {
    isFetchingRef.current = isFetching;
    isScanningSequenceRef.current = isScanningSequence;
    activeArtworkRef.current = activeArtwork;
  }, [isFetching, isScanningSequence, activeArtwork]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let timeoutId;
    if (
      !isTracking &&
      !isScanningSequence &&
      !paintingDetected &&
      pendingTargetIndex === null
    ) {
      timeoutId = setTimeout(() => setShowNotScannableHint(true), 8000);
    } else {
      setShowNotScannableHint(false);
    }
    return () => clearTimeout(timeoutId);
  }, [isTracking, isScanningSequence, paintingDetected, pendingTargetIndex]);

  const handleDetection = useCallback((index) => {
    setIsTracking(true);
    setShowNotScannableHint(false);

    if (
      activeArtworkRef.current &&
      activeArtworkRef.current.target_index === index
    )
      return;
      
    if (isFetchingRef.current || isScanningSequenceRef.current) return;

    setPendingTargetIndex(index);
    
    setPaintingDetected(false); 
  }, []);

  const handleTargetLost = useCallback(() => {
    setIsTracking(false);
    setPendingTargetIndex(null);
  }, []);

  const startScanSequence = async () => {
    if (pendingTargetIndex === null) return;

    setIsFetching(true);
    try {
      const data = artworkMap.get(pendingTargetIndex);
      if (!data) throw new Error("Artwork data not found in cache");

      setActiveArtwork(data);
      setIsScanningSequence(true);
      setScanProgress(0);
      setPendingTargetIndex(null);
      setShowTapToScanBtn(false);
      setIsPanelCollapsed(false); 

      let startTime = null;
      const duration = 1500;

      const animateScan = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        setScanProgress(progress);

        if (progress < 100) {
          animationRef.current = requestAnimationFrame(animateScan);
        } else {
          (async () => {
            const visitorId = localStorage.getItem("artifact_visitor_id");
            if (visitorId && !unlockedSet.has(data.id)) {
              const newBadge = {
                visitor_id: visitorId,
                artwork_id: data.id,
                badge_type: "Base",
                created_at: new Date().toISOString(),
              };

              const currentCache = JSON.parse(
                localStorage.getItem("artifact_cached_badges") || "[]",
              );
              currentCache.push(newBadge);
              localStorage.setItem(
                "artifact_cached_badges",
                JSON.stringify(currentCache),
              );

              const offlineQueue = JSON.parse(
                localStorage.getItem("artifact_offline_queue") || "[]",
              );
              offlineQueue.push(newBadge);
              localStorage.setItem(
                "artifact_offline_queue",
                JSON.stringify(offlineQueue),
              );

              if (visitorId && !unlockedSet.has(data.id)) {
                setBadgeOverlay({ 
                  tier: "Bronze", 
                  artwork: data,
                  name: data.badge_name?.[currentLang] || data.badge_name?.eng || data.title?.[currentLang] || data.title?.eng
                });
                
                setTimeout(() => setBadgeOverlay(null), 2500);
              }

              try {
                const { error } = await supabase
                  .from("unlocked_badges")
                  .insert([
                    {
                      visitor_id: visitorId,
                      artwork_id: data.id,
                      badge_type: "Base",
                    },
                  ]);

                if (error) throw error;

                const updatedQueue = JSON.parse(
                  localStorage.getItem("artifact_offline_queue") || "[]",
                ).filter((b) => b.artwork_id !== data.id);
                localStorage.setItem(
                  "artifact_offline_queue",
                  JSON.stringify(updatedQueue),
                );
              } catch (err) {
                console.warn(
                  "Network offline. Badge saved locally and will sync later.",
                  err.message,
                );
              } finally {
                await refreshBadges();
              }
            }
          })();

          setIsScanningSequence(false);
          setPaintingDetected(true);
          setIsFetching(false);
        }
      };

      animationRef.current = requestAnimationFrame(animateScan);
    } catch (err) {
      console.error("Error:", err.message);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let delayTimer;
    if (pendingTargetIndex !== null) {
      if (unlockedByIndex[pendingTargetIndex]) {
        startScanSequence();
      } else {
        delayTimer = setTimeout(() => setShowTapToScanBtn(true), 2000);
      }
    } else {
      setShowTapToScanBtn(false);
    }
    return () => clearTimeout(delayTimer);
  }, [pendingTargetIndex, unlockedByIndex]);

  return (
    <div className="relative h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-neohellenic">
      {toastMessage && (
        <div className="absolute top-28 left-0 w-full flex justify-center z-[100] animate-fade-in-up pointer-events-none">
          <div className="bg-[#4C8C5C] text-white px-6 py-3 rounded-full shadow-2xl border-2 border-[#1B4B18] font-serif flex items-center gap-3">
            <span className="text-2xl drop-shadow-md"></span>
            <span className="text-lg tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      <ArErrorBoundary>
        <ArScanner
          onTargetFound={handleDetection}
          onTargetLost={handleTargetLost}
          unlockedByIndex={unlockedByIndex}
        />
      </ArErrorBoundary>

      <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-40 pointer-events-none">
        <div
          className={`backdrop-blur-sm text-white font-arial text-[11px] rounded-full border shadow-lg transition-colors duration-300 w-[135px] h-[26px] flex items-center overflow-hidden relative ${
            isScanningSequence || pendingTargetIndex !== null
              ? "bg-[#381111]/90 border-[#E6BA39]/50 text-[#E6BA39]"
              : showNotScannableHint && !paintingDetected
                ? "bg-[#A35252]/90 border-[#5A2020]/50"
                : !isTracking && paintingDetected
                  ? "bg-black/50 border-white/10 opacity-90"
                  : "bg-black/70 border-white/10"
          }`}
        >
          <div className="animate-ticker flex items-center h-full tracking-wide">
            {paintingDetected && activeArtwork
              ? `${activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}`
              : isScanningSequence
                ? `${t("Scanning Artwork...")} ${Math.floor(scanProgress)}%`
                : pendingTargetIndex !== null
                  ? t("Target Acquired!")
                  : showNotScannableHint
                    ? t("Target not recognized. Check map!")
                    : t("Scan an Artwork...")}
          </div>
        </div>

        <div
          className={`backdrop-blur-sm font-arial text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border shadow-lg transition-colors flex-shrink-0 flex items-center justify-center h-[26px] ${
            isTracking
              ? "bg-[#1B4B18]/90 border-[#2D8029] text-white animate-pulse"
              : paintingDetected
                ? "bg-[#A35252]/90 border-[#5A2020] text-white"
                : "bg-[#122B14]/80 border-[#2D8029]/70 text-[#74C365]"
          }`}
        >
          {isTracking
            ? t("Tracking Active")
            : paintingDetected
              ? t("Tracking Paused")
              : t("AR Ready")}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${isScanningSequence || paintingDetected ? "opacity-0" : "opacity-100"}`}
          >
            <div
              className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl transition-all duration-300 ${showNotScannableHint ? "border-[#A35252]" : pendingTargetIndex !== null ? "border-[#E6BA39] scale-110 shadow-lg" : "border-artifact-card opacity-80"}`}
            ></div>
            <div
              className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl transition-all duration-300 ${showNotScannableHint ? "border-[#A35252]" : pendingTargetIndex !== null ? "border-[#E6BA39] scale-110 shadow-lg" : "border-artifact-card opacity-80"}`}
            ></div>
            <div
              className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl transition-all duration-300 ${showNotScannableHint ? "border-[#A35252]" : pendingTargetIndex !== null ? "border-[#E6BA39] scale-110 shadow-lg" : "border-artifact-card opacity-80"}`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl transition-all duration-300 ${showNotScannableHint ? "border-[#A35252]" : pendingTargetIndex !== null ? "border-[#E6BA39] scale-110 shadow-lg" : "border-artifact-card opacity-80"}`}
            ></div>
          </div>

          <div
            className={`absolute inset-4 border rounded-[2rem] overflow-hidden transition-all duration-500 ${
              isScanningSequence
                ? "border-[#E6BA39]/80 shadow-[inset_0_0_50px_rgba(230,186,57,0.3)] backdrop-contrast-150 backdrop-saturate-[1.2]"
                : "border-transparent"
            }`}
          >
            <div
              className={`absolute inset-0 bg-[#E6BA39]/10 transition-opacity duration-500 ${isScanningSequence ? "opacity-100" : "opacity-0"}`}
            ></div>
          </div>

          <div
            className={`absolute -bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
              pendingTargetIndex !== null &&
              !isScanningSequence &&
              !paintingDetected &&
              showTapToScanBtn
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-8 scale-95 pointer-events-none"
            }`}
          >
            <button
              onClick={startScanSequence}
              className="px-10 py-2.5 rounded-full bg-[#F5D896] border-[3px] border-[#3A1414] text-[#3A1414] font-serif font-bold text-[19px] tracking-widest shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-pulse hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
            >
              {t("SCAN")}
            </button>
          </div>

          {!paintingDetected &&
            !isScanningSequence &&
            pendingTargetIndex === null && (
              <div
                className={`absolute top-8 left-8 right-8 h-[2px] shadow-[0_0_12px_#EBDAB5] animate-scan transition-colors duration-300 ${showNotScannableHint ? "bg-[#A35252]" : "bg-artifact-card"}`}
              ></div>
            )}

          {isScanningSequence && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(230,186,57,0.8)]"
              viewBox="0 0 288 288"
            >
              <circle
                cx="144"
                cy="144"
                r="140"
                fill="none"
                stroke="#E6BA39"
                strokeWidth="3"
                strokeDasharray="880"
                strokeDashoffset={880 - (880 * scanProgress) / 100}
                className="transition-all duration-75 ease-linear"
              />
            </svg>
          )}
        </div>
      </div>

      {paintingDetected && activeArtwork && !showInfoModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end items-center pb-[120px] pointer-events-none">
          
          <div 
            className={`w-11/12 max-w-sm bg-artifact-bg/95 backdrop-blur-md border border-artifact-card/30 rounded-[2rem] p-6 shadow-2xl pointer-events-auto relative transition-all duration-500 ease-in-out ${
              isPanelCollapsed 
                ? "transform translate-y-[200%] opacity-0 pointer-events-none" 
                : "transform translate-y-0 opacity-100"
            }`}
          >
            <button
              onClick={() => setIsPanelCollapsed(true)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all z-10"
              title="Minimize panel"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                className="w-4 h-4 transform rotate-180" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>

            <div className="flex justify-between items-start mb-4 pr-6">
              <div>
                <h3
                  className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-museum-gold text-2xl tracking-wide`}
                >
                  {activeArtwork.title?.[currentLang] ||
                    activeArtwork.title?.eng}
                </h3>
                <p className="font-serif italic text-museum-gold/90 text-sm mt-1">
                  {activeArtwork.artist?.[currentLang] ||
                    activeArtwork.artist?.eng}{" "}
                  {activeArtwork.artist_year
                    ? `• ${activeArtwork.artist_year}`
                    : ""}
                </p>
              </div>
            </div>

            <p
              className={`${isCJK ? "font-sans" : "font-neohellenic"} text-white/90 text-sm mb-4 leading-relaxed line-clamp-2`}
            >
              {activeArtwork.clues?.[currentLang] ||
                activeArtwork.clues?.eng ||
                t("Explore the details of this masterpiece...")}
            </p>

            <hr className="border-t-[1.5px] border-dotted border-white/40 mb-5" />

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate("/quiz", { state: { artwork: activeArtwork } })
                }
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md active:scale-95"
              >
                {t("Try Quiz?")}
              </button>
              <button
                onClick={() => {
                  setActiveModalTab("origin");
                  setIsInfoExpanded(false);
                  setShowInfoModal(true);
                }}
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md active:scale-95"
              >
                {t("Read more...")}
              </button>
            </div>
          </div>

          <div 
            className={`absolute bottom-32 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out ${
              isPanelCollapsed 
                ? "opacity-100 scale-100 pointer-events-auto" 
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <button
              onClick={() => setIsPanelCollapsed(false)}
              className="px-4 py-1.5 rounded-full bg-[#381111]/95 border-1 text-white font-serif font-medium text-base tracking-wider shadow-[0_4px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm hover:bg-[#381111] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                className="w-4 h-4 animate-bounce"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" fill="none" className="transform rotate-180 origin-center" />
              </svg>
              {t("Artwork Info")}
            </button>
          </div>

        </div>
      )}

      {showInfoModal && activeArtwork && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className={`bg-[#E0CCB6] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative border border-[#C4AB8F] transition-all duration-300 ${
              isInfoExpanded ? "h-[90vh]" : ""
            }`}
          >
            <div className="bg-[#381111] py-4 px-6 flex justify-between items-center text-white font-serif shadow-sm">
              <span className="text-2xl">{t("About")}</span>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-xl opacity-80 hover:opacity-100 transition-opacity"
              >
                [x]
              </button>
            </div>

          {!isInfoExpanded && (
            <div className="mx-5 mt-5 h-52 bg-[#D1C2B0] border border-[#BBA58F] flex items-center justify-center text-[#998670] font-serif text-3xl overflow-hidden rounded-lg relative">
              {activeModalTab === "artist_description" ? (
                activeArtwork.artist_image_url ? (
                  <img
                    src={activeArtwork.artist_image_url}
                    alt="Artist Photograph"
                    className="w-full h-full object-cover opacity-90 scale-[1.03]"
                  />
                ) : (
                  <span className="text-[#998670] text-sm font-serif italic">
                    {t("Image Unavailable")}
                  </span>
                )
              ) : activeArtwork.thumbnail_url ? (
                <img
                  src={activeArtwork.thumbnail_url}
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
              {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
            </h2>
            <p className="text-center font-serif italic text-[#783713] text-sm mb-4">
              {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng}{" "}
              {activeArtwork.artist_year
                ? `• ${activeArtwork.artist_year}`
                : ""}
            </p>

            <div
              className={`mx-5 bg-[#F5EAD4] p-4 rounded-xl border border-[#E0CCB6] relative mb-4 transition-all duration-300
                  ${
                      isInfoExpanded
                          ? "h-[30rem]"
                          : "h-48"
                  }
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
                {typeof activeArtwork[activeModalTab] === "object" &&
                activeArtwork[activeModalTab] !== null
                  ? activeArtwork[activeModalTab][currentLang] ||
                    activeArtwork[activeModalTab].eng
                  : activeArtwork[activeModalTab] ||
                    t("More information coming soon...")}
              </div>

              {activeModalTab === "artist_description" && (
                <div className="mt-5 pt-4 border-t border-[#C4AB8F]/50">
                  <h4 className="font-serif font-bold text-[#783713] mb-3 text-base text-left">
                    {t("Related Works")}
                  </h4>
                  <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                    {activeArtwork.related_arts &&
                    activeArtwork.related_arts.length > 0 ? (
                      activeArtwork.related_arts.map((art, idx) => (
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
                  navigate("/mini-game", { state: { artwork: activeArtwork } })
                }
                className="w-full border border-[#783713] text-[#783713] hover:bg-[#783713] hover:text-[#E0CCB6] shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-95 font-serif rounded-xl py-2.5 text-lg flex items-center justify-center gap-2.5"
              >
                <svg 
                  viewBox="0 0 512 512" 
                  className="w-6 h-6"
                >
                  <g>
                    <path fill="currentColor" d="M510.002,309.835l-0.068-0.326l-0.076-0.334l-26.508-112.721l-0.106-0.417l-0.106-0.418
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
                C489.413,347.912,470.75,380.178,439.318,390.397z"/>
                    <polygon fill="currentColor" points="157.453,172.061 123.912,172.061 123.912,210.579 85.387,210.579 85.387,244.105 123.912,244.105 
                123.912,282.637 157.453,282.637 157.453,244.105 195.978,244.105 195.978,210.579 157.453,210.579 	"/>
                    <path fill="currentColor" d="M365.721,206.247c11.668,0,21.113-9.445,21.113-21.098c0-11.669-9.445-21.114-21.113-21.114
                c-11.653,0-21.098,9.445-21.098,21.114C344.622,196.802,354.068,206.247,365.721,206.247z"/>
                    <path fill="currentColor" d="M323.509,206.247c-11.653,0-21.106,9.453-21.106,21.098c0,11.669,9.453,21.122,21.106,21.122
                c11.661,0,21.106-9.453,21.106-21.122C344.615,215.7,335.17,206.247,323.509,206.247z"/>
                    <path fill="currentColor" d="M365.721,248.459c-11.653,0-21.098,9.445-21.098,21.114c0,11.653,9.445,21.098,21.098,21.098
                c11.668,0,21.113-9.445,21.113-21.098C386.834,257.904,377.388,248.459,365.721,248.459z"/>
                    <path fill="currentColor" d="M407.933,206.247c-11.653,0-21.099,9.453-21.099,21.098c0,11.669,9.446,21.122,21.099,21.122
                c11.66,0,21.113-9.453,21.113-21.122C429.046,215.7,419.593,206.247,407.933,206.247z"/>
                  </g>
                </svg>
                <span>{t("Mini-Game")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {badgeOverlay && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none animate-fade-in-up">
          <div className="w-10/12 max-w-[300px] bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl relative border border-white/5">
            <div className="bg-[#E0CCB6] rounded-xl pt-6 pb-8 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
              <h3 className={`${isCJK ? "font-sans" : "font-serif"} text-[#4A260F] text-2xl`}>
                {t("Badge Unlocked!")}
              </h3>

              <div className="w-full h-[4px] bg-[#8b7463]/40 mb-6"></div>

              <div className="w-28 h-28 rounded-full mb-4 border-[6px] border-[#CD7F32] overflow-hidden flex items-center justify-center animate-ink-stamp">
                {badgeOverlay.artwork.badge_url ? (
                  <img
                    src={badgeOverlay.artwork.badge_url}
                    alt="Unlocked Badge"
                    className="w-full h-full object-cover saturate-100"
                  />
                ) : (
                  <span className="text-[#CD7F32] text-3xl font-serif">★</span>
                )}
              </div>

              <p className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#783713] text-xl leading-tight`}>
                {badgeOverlay.name}
              </p>
              
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;