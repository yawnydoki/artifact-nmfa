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

  const [paintingDetected, setPaintingDetected] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(null); 
  const [isFetching, setIsFetching] = useState(false);

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

      <p className="absolute top-12 text-white/80 font-daruma tracking-widest text-lg drop-shadow-md z-10">
        {t.scanPrompt}
      </p>

      {paintingDetected && activeArtwork && (
        <div className="absolute bottom-32 w-11/12 max-w-sm bg-[#16120c] border-4 border-[#4A2E1B] rounded-2xl p-1 shadow-xl animate-fade-in-up z-40">
          <div className="bg-[#EBDAB5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              
              <h3 className="font-daruma text-[#4A2E1B] text-2xl">
                {activeArtwork.title?.[currentLang] || activeArtwork.title?.eng}
              </h3>
              
              <span className="bg-[#4A2E1B] text-white text-xs font-bold px-2 py-1 rounded-full">
                {t.baseBadge}
              </span>
            </div>
            
            <p className="text-[#4A2E1B] text-xs mb-4">
              {activeArtwork.artist?.[currentLang] || activeArtwork.artist?.eng}
            </p>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4A2E1B] text-[#EBDAB5] py-2 rounded-full font-daruma tracking-wider text-sm hover:opacity-90">
                {t.viewInfo}
              </button>
              <button 
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
                className="flex-1 bg-white border-2 border-[#4A2E1B] text-[#4A2E1B] py-2 rounded-full font-daruma tracking-wider text-sm hover:bg-gray-100"
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