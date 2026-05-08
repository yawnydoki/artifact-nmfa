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

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("clues"); 

  const handleDetection = async (index) => {
    if (isFetching || (activeArtwork && activeArtwork.target_index === index)) return;
    setIsFetching(true);
    try {
      const { data, error } = await supabase.from('artworks').select('*').eq('target_index', index).single();
      if (error) throw error;
      setActiveArtwork(data);
      setPaintingDetected(true);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-neohellenic">
      <ArScanner onTargetFound={handleDetection} />

      <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-40 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm text-white font-arial text-xs px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
          {paintingDetected && activeArtwork 
            ? `${activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}` 
            : t.scanPrompt || "Scanning Artwork..."}
        </div>
        
        <div className="bg-[#2D5A27]/90 backdrop-blur-sm text-white font-arial text-xs px-4 py-1.5 rounded-full border border-white/20 shadow-lg animate-pulse">
          AR Ready
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="relative w-72 h-72">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-artifact-card rounded-tl-3xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-artifact-card rounded-tr-3xl opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-artifact-card rounded-bl-3xl opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-artifact-card rounded-br-3xl opacity-80"></div>
          
          <div className="absolute inset-4 border border-artifact-card/30 rounded-[2rem]"></div>
          
          {!paintingDetected && (
            <div className="absolute top-8 left-8 right-8 h-[2px] bg-artifact-card shadow-[0_0_12px_#EBDAB5] animate-scan"></div>
          )}
        </div>
      </div>

      {paintingDetected && activeArtwork && !showInfoModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end items-center pb-[120px] pointer-events-none">
          <div className="w-11/12 max-w-sm bg-artifact-bg/95 backdrop-blur-md border border-artifact-card/30 rounded-[2rem] p-6 shadow-2xl animate-fade-in-up pointer-events-auto">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-museum-gold text-2xl tracking-wide`}>
                  {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
                </h3>
                <p className="font-serif italic text-museum-gold/90 text-sm mt-1">
                  {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng} • 1884
                </p>
              </div>
              
              <span className="bg-artifact-border/80 text-artifact-card font-daruma text-[11px] font-bold px-3 py-1.5 rounded-full tracking-widest border border-artifact-card/20 animate-pulse shadow-inner">
                {t.baseBadge || "Badge Ready"}
              </span>
            </div>
            
            <p className={`${isCJK ? 'font-sans' : 'font-neohellenic'} text-white/90 text-sm mb-4 leading-relaxed line-clamp-2`}>
               {activeArtwork.clues?.[currentLang] || activeArtwork.clues?.eng || "Explore the details of this masterpiece..."}
            </p>
            
            <hr className="border-t-[1.5px] border-dotted border-white/40 mb-5" />
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md"
              >
                {t.startQuiz || "Start Quiz"}
              </button>
              <button 
                onClick={() => {
                  setActiveModalTab("clues");
                  setShowInfoModal(true);
                }}
                className="flex-1 bg-museum-gold text-artifact-bg py-2.5 rounded-full font-serif text-lg tracking-wide hover:brightness-110 transition-all shadow-md"
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

            <div className="mx-5 mt-5 h-52 bg-[#D1C2B0] border border-[#BBA58F] flex items-center justify-center text-[#998670] font-serif text-3xl">
              img
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
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors ${activeModalTab === "origin" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.origin || "Origin"}
              </button>
              <button 
                onClick={() => setActiveModalTab("artist")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-sm transition-colors ${activeModalTab === "artist" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.artist || "Artist"}
              </button>
              <button 
                onClick={() => setActiveModalTab("art_element")}
                className={`border border-[#783713] rounded-xl font-serif py-1.5 text-[12px] transition-colors ${activeModalTab === "art_element" ? "bg-[#783713] text-[#E0CCB6]" : "text-[#783713] hover:bg-[#783713]/10"}`}
              >
                {t.elements || "Art Elements"}
              </button>
            </div>

            <div className="mx-5 mb-6">
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className="w-full border border-[#783713] text-[#783713] hover:bg-[#783713] hover:text-[#E0CCB6] transition-colors font-serif rounded-xl py-2.5 text-lg"
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