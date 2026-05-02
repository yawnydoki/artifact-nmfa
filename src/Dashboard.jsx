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
  const isCJK = ['chinese', 'jap', 'kor'].includes(currentLang);

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
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center font-hind">
      <ArScanner onTargetFound={handleDetection} />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-transparent pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl opacity-70"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl opacity-70"></div>
      </div>

      <p className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} absolute top-12 text-white/80 tracking-widest text-lg drop-shadow-md z-10`}>
        {t.scanPrompt}
      </p>

      {paintingDetected && activeArtwork && !showInfoModal && (
        <div className="absolute bottom-32 w-11/12 max-w-sm bg-[#16120c] border-4 border-[#4A2E1B] rounded-2xl p-1 shadow-xl animate-fade-in-up z-40">
          <div className="bg-[#EBDAB5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-[#4A2E1B] text-2xl`}>
                {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
              </h3>
              <span className="bg-[#4A2E1B] text-white text-xs font-bold px-2 py-1 rounded-full">
                {t.baseBadge}
              </span>
            </div>
            
            <p className={`${isCJK ? 'font-sans' : 'font-hind'} text-[#4A2E1B] text-xs mb-4`}>
              {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng}
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setActiveModalTab("clues");
                  setShowInfoModal(true);
                }}
                className={`flex-1 bg-[#4A2E1B] text-[#EBDAB5] py-2 rounded-full ${isCJK ? 'font-sans font-bold' : 'font-daruma'} tracking-wider text-sm hover:opacity-90`}
              >
                {t.viewInfo}
              </button>

              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className={`flex-1 bg-white border-2 border-[#4A2E1B] text-[#4A2E1B] py-2 rounded-full ${isCJK ? 'font-sans font-bold' : 'font-daruma'} tracking-wider text-sm hover:bg-gray-100`}
              >
                {t.startQuiz}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && activeArtwork && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-md animate-fade-in-up">
          <div className="bg-artifact-passport w-full h-[85%] rounded-t-[40px] p-4 flex flex-col items-center relative border-t-4 border-artifact-card pb-[100px]">
           
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-artifact-card rounded-full text-artifact-border font-bold shadow-md hover:bg-white z-10"
            >
              ✕
            </button>

            <div className="w-11/12 max-w-sm mt-12 bg-artifact-card flex-1 rounded-3xl p-5 border-b-8 border-[#C9B99A] shadow-xl flex flex-col overflow-hidden">
          
              <div className="w-full h-48 flex-shrink-0 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-500 font-bold border-2 border-artifact-border/20">
                Img
              </div>

              <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-artifact-border text-3xl mb-1 flex-shrink-0`}>
                {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
              </h2>
              
              <p className={`${isCJK ? 'font-sans' : 'font-hind'} text-artifact-border font-bold text-sm mb-4 flex-shrink-0`}>
                by {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng}
              </p>

              <div className={`text-artifact-border/80 text-sm mb-6 flex-1 overflow-y-auto pr-2 bg-white/40 p-3 rounded-xl border border-[#C9B99A] ${isCJK ? 'font-sans leading-relaxed' : 'font-hind'}`}>
                {typeof activeArtwork[activeModalTab] === 'object' && activeArtwork[activeModalTab] !== null
                  ? activeArtwork[activeModalTab][currentLang] || activeArtwork[activeModalTab].eng
                  : activeArtwork[activeModalTab] || "More information coming soon..."}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 flex-shrink-0">
                <button 
                  onClick={() => setActiveModalTab("origin")}
                  className={`rounded-full py-2 ${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "origin" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.origin}
                </button>
                <button 
                  onClick={() => setActiveModalTab("artist")}
                  className={`rounded-full py-2 ${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "artist" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.artist}
                </button>
                <button 
                  onClick={() => setActiveModalTab("art_element")}
                  className={`rounded-full py-2 ${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-sm transition-colors border-2 border-artifact-border ${
                    activeModalTab === "art_element" 
                    ? "bg-artifact-border text-artifact-card" 
                    : "bg-transparent text-artifact-border hover:bg-gray-100"
                  }`}
                >
                  {t.elements}
                </button>
              </div>

              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className={`w-full flex-shrink-0 bg-artifact-gold text-artifact-border rounded-full py-3 ${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-lg tracking-wider shadow-md hover:brightness-110 transition-all`}
              >
                {t.startQuiz}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;