import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArScanner from './ArScanner';
import { supabase } from './supabaseClient'; 
import { useLanguage } from './LanguageContext'; 
import { uiDict } from './translations'; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { currentLang } = useLanguage(); 
  const t = uiDict[currentLang] || uiDict.eng;
  const isCJK = ['chi', 'jap', 'kor'].includes(currentLang);

  const [paintingDetected, setPaintingDetected] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(null); 
  const [isFetching, setIsFetching] = useState(false);

  const [isTracking, setIsTracking] = useState(false); 
  const [isScanningSequence, setIsScanningSequence] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("clues"); 

  const handleDetection = async (index) => {
    setIsTracking(true); 

    if (activeArtwork && activeArtwork.target_index === index) {
      return;
    }

    if (isFetching || isScanningSequence) return;
    
    setIsFetching(true);
    try {
      const { data, error } = await supabase.from('artworks').select('*').eq('target_index', index).single();
      if (error) throw error;
      
      setActiveArtwork(data);
      setIsScanningSequence(true);
      setScanProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setScanProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsScanningSequence(false);
          setPaintingDetected(true); 
          setIsFetching(false);
        }
      }, 75);

    } catch (err) {
      console.error("Error:", err.message);
      setIsFetching(false);
    }
  };

  const handleTargetLost = () => {
    setIsTracking(false);
  };

  return (
    <div className="relative h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-neohellenic">
      
      <ArScanner 
        onTargetFound={handleDetection} 
        onTargetLost={handleTargetLost} 
      />

      <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-40 pointer-events-none">
        
        <div className={`backdrop-blur-sm text-white font-arial text-xs px-4 py-1.5 rounded-full border shadow-lg transition-colors ${
          isScanningSequence ? 'bg-[#381111]/80 border-[#E6BA39]/50 text-[#E6BA39]' : 
          (!isTracking && paintingDetected) ? 'bg-black/40 border-white/5 opacity-80' :
          'bg-black/60 border-white/10'
        }`}>
          {paintingDetected && activeArtwork 
            ? `${activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}` 
            : isScanningSequence 
            ? `Scanning Artwork... ${scanProgress}%` 
            : t.scanPrompt || "Scan an Artwork..."}
        </div>
        
        <div className={`backdrop-blur-sm text-white font-arial text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border shadow-lg transition-colors ${
          isTracking ? 'bg-[#1B4B18]/90 border-[#2D8029]/50 animate-pulse' :
          paintingDetected ? 'bg-[#A35252]/90 border-[#5A2020]/50' : 
          'bg-[#1B4B18]/90 border-[#2D8029]/50 animate-pulse'
        }`}>
          {isTracking ? "Tracking Active" : paintingDetected ? "Tracking Paused" : "AR Ready"}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="relative w-72 h-72">
          
          <div className={`transition-opacity duration-300 ${isScanningSequence || paintingDetected ? 'opacity-0' : 'opacity-80'}`}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-artifact-card rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-artifact-card rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-artifact-card rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-artifact-card rounded-br-3xl"></div>
          </div>
          
          <div className={`absolute inset-4 border rounded-[2rem] overflow-hidden transition-all duration-500 ${
            isScanningSequence 
              ? 'border-[#E6BA39]/80 shadow-[inset_0_0_50px_rgba(230,186,57,0.3)] backdrop-contrast-150 backdrop-saturate-[1.2]' 
              : 'border-transparent'
          }`}>
            <div className={`absolute inset-0 bg-[#E6BA39]/10 transition-opacity duration-500 ${isScanningSequence ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>
          
          {!paintingDetected && !isScanningSequence && (
            <div className="absolute top-8 left-8 right-8 h-[2px] bg-artifact-card shadow-[0_0_12px_#EBDAB5] animate-scan"></div>
          )}

          {isScanningSequence && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(230,186,57,0.8)]" viewBox="0 0 288 288">
              <circle cx="144" cy="144" r="140" fill="none" stroke="#E6BA39" strokeWidth="3" strokeDasharray="880" strokeDashoffset={880 - (880 * scanProgress) / 100} className="transition-all duration-75 ease-linear"/>
            </svg>
          )}

        </div>
      </div>

      {paintingDetected && activeArtwork && !showInfoModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end items-center pb-[120px] pointer-events-none">
          <div className="w-11/12 max-w-sm bg-artifact-bg/95 backdrop-blur-md border border-artifact-card/30 rounded-[2rem] p-6 shadow-2xl animate-fade-in-up pointer-events-auto relative">
            
            <button 
              onClick={() => {
                setPaintingDetected(false);
                setActiveArtwork(null);
                setIsTracking(false);
              }}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
            >
              ✕
            </button>

            <div className="flex justify-between items-start mb-4 pr-6">
              <div>
                <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-museum-gold text-2xl tracking-wide`}>
                  {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
                </h3>
                <p className="font-serif italic text-museum-gold/90 text-sm mt-1">
                  {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng} • 1884
                </p>
              </div>
            </div>
            
            <p className={`${isCJK ? 'font-sans' : 'font-neohellenic'} text-white/90 text-sm mb-4 leading-relaxed line-clamp-2`}>
               {activeArtwork.clues?.[currentLang] || activeArtwork.clues?.eng || "Explore the details of this masterpiece..."}
            </p>
            
            <hr className="border-t-[1.5px] border-dotted border-white/40 mb-5" />
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md active:scale-95"
              >
                {t.startQuiz || "Start Quiz"}
              </button>
              <button 
                onClick={() => {
                  setActiveModalTab("clues");
                  setShowInfoModal(true);
                }}
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md active:scale-95"
              >
                {t.viewInfo || "Read more..."}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && activeArtwork && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#E0CCB6] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative border border-[#C4AB8F]">
            
            <div className="bg-[#381111] py-4 px-6 flex justify-between items-center text-white font-serif shadow-sm">
              <span className="text-2xl">About</span>
              <button onClick={() => setShowInfoModal(false)} className="text-xl opacity-80 hover:opacity-100 transition-opacity">
                [x]
              </button>
            </div>

            <div className="mx-5 mt-5 h-52 bg-[#D1C2B0] border border-[#BBA58F] flex items-center justify-center text-[#998670] font-serif text-3xl overflow-hidden rounded-lg">
               {activeArtwork.badge_url ? (
                  <img src={activeArtwork.badge_url} alt="Artwork" className="w-full h-full object-cover opacity-80" />
               ) : (
                 "img"
               )}
            </div>

            <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-center text-[2.5rem] text-[#4A260F] mt-3 leading-none`}>
              {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
            </h2>
            <p className="text-center font-serif italic text-[#783713] text-sm mb-4">
              {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng} • 1884
            </p>

            <div className={`mx-5 bg-[#F5EAD4] p-4 rounded-xl h-36 overflow-y-auto hide-scrollbar mb-4 ${isCJK ? 'font-sans text-sm' : 'font-neohellenic text-[15px]'} text-[#4A260F]/80 border border-[#E0CCB6]`}>
              {typeof activeArtwork[activeModalTab] === 'object' && activeArtwork[activeModalTab] !== null
                ? activeArtwork[activeModalTab][currentLang] || activeArtwork[activeModalTab].eng
                : activeArtwork[activeModalTab] || "More information coming soon..."}
            </div>

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

            <div className="mx-5 mb-6">
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
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

export default Dashboard;