import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { uiDict } from './translations';
import { supabase } from './supabaseClient';

const MuseumMap = () => {
  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;
  
  const isCJK = ['chi', 'jap', 'kor'].includes(currentLang);

  const [activeZone, setActiveZone] = useState(null); 
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isExpanded, setIsExpanded] = useState(false); 

  useEffect(() => {
    const fetchMapData = async () => {
      const visitorId = localStorage.getItem('artifact_visitor_id');
      if (!visitorId) return;

      try {
        const { data: artworksData, error: artworksError } = await supabase.from('artworks').select('*');
        if (artworksError) throw artworksError;

        const { data: badgesData, error: badgesError } = await supabase
          .from('unlocked_badges')
          .select('artwork_id')
          .eq('visitor_id', visitorId);
        if (badgesError) throw badgesError;

        const mergedData = artworksData.map(artwork => ({
          ...artwork,
          isUnlocked: badgesData.some(b => b.artwork_id === artwork.id)
        }));

        setArtworks(mergedData);
      } catch (error) {
        console.error("Error fetching map data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const activeClues = artworks.filter(art => art.zone === activeZone);

  const mapZones = [
    { id: 1, color: 'bg-[#C973A4]' }, // pink top one
    { id: 2, color: 'bg-[#3E5D36]' }, // bot left dark green
    { id: 3, color: 'bg-[#9F7657]' }, // bot mid brown
    { id: 4, color: 'bg-[#9AB053]' }  // bot right light green
  ];

  return (
    <div className="h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center pt-12 pb-[120px] relative box-border transition-colors duration-500">
      
      <div className={`w-11/12 max-w-sm mb-4 pl-2 flex-shrink-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-white text-3xl tracking-wide`}>
          {t.museumMap || "Museum Map"}
        </h2>
      </div>

      <div className={`w-11/12 max-w-sm flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden flex flex-col items-center ${isExpanded ? 'max-h-0 opacity-0 mb-0' : 'max-h-[500px] opacity-100 mb-6'}`}>
        <div className="w-full bg-artifact-card p-3 rounded-[1.5rem] shadow-xl">
          <div className="flex flex-col gap-2 h-64">
            <div 
              className={`w-full h-1/3 ${mapZones[0].color} flex items-center justify-center cursor-pointer transition-all ${activeZone === 1 ? 'ring-4 ring-white z-10 scale-[1.02]' : 'hover:brightness-110'}`}
              onClick={() => setActiveZone(1)}
            >
              <div className="text-white drop-shadow-md"><PinIcon size="w-8 h-8" /></div>
            </div>

            <div className="w-full h-2/3 flex gap-2">

              <div 
                className={`flex-1 ${mapZones[1].color} flex items-center justify-center cursor-pointer transition-all ${activeZone === 2 ? 'ring-4 ring-white z-10 scale-[1.02]' : 'hover:brightness-110'}`}
                onClick={() => setActiveZone(2)}
              >
                <div className="text-white drop-shadow-md"><PinIcon size="w-8 h-8" /></div>
              </div>

              <div 
                className={`flex-[3] ${mapZones[2].color} flex items-center justify-center cursor-pointer transition-all ${activeZone === 3 ? 'ring-4 ring-white z-10 scale-[1.02]' : 'hover:brightness-110'}`}
                onClick={() => setActiveZone(3)}
              >
                <div className="text-white drop-shadow-md"><PinIcon size="w-8 h-8" /></div>
              </div>

              <div 
                className={`flex-1 ${mapZones[3].color} flex items-center justify-center cursor-pointer transition-all ${activeZone === 4 ? 'ring-4 ring-white z-10 scale-[1.02]' : 'hover:brightness-110'}`}
                onClick={() => setActiveZone(4)}
              >
                <div className="text-white drop-shadow-md"><PinIcon size="w-8 h-8" /></div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 flex flex-col min-h-0 transition-all duration-500">
        
        <div className="flex justify-between items-end mb-3 px-2 flex-shrink-0">
          <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-white text-[1.2rem] drop-shadow-sm`}>
            {t.clueBehind || "Clues in the Area"}
          </h3>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-museum-gold text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-0.5 hover:brightness-110 transition-all bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md"
          >
            {isExpanded ? "Show Map" : "Full View"}
            <svg 
              className={`w-3 h-3 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <div className="bg-[#1D0C09] p-3 rounded-[2rem] shadow-2xl flex-1 flex flex-col min-h-0 border border-white/5">
          <div className="bg-artifact-card rounded-[1.4rem] p-4 flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4 relative">
            
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-artifact-border font-serif animate-pulse text-lg italic">
                {t.loading || "Accessing archives..."}
              </div>
            ) : !activeZone ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/60 font-serif italic p-10">
                {t.selectArea || "Select a colored wing on the map to reveal the hidden masterpieces."}
              </div>
            ) : activeClues.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/60 font-serif italic">
                {t.areaEmpty || "This gallery currently holds no secrets."}
              </div>
            ) : (
              activeClues.map((art) => (
                <div 
                  key={art.id} 
                  className="p-5 rounded-2xl border border-artifact-border/30 bg-artifact-card/40 shadow-sm flex flex-col items-center justify-center text-center flex-shrink-0 min-h-[140px] animate-fade-in-up"
                >
                  {art.isUnlocked ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-artifact-border text-2xl leading-tight tracking-tight`}>
                        {art.title?.[currentLang] || art.title?.eng}
                      </span>
                      <span className="bg-[#3E5D36] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-[0.2em] shadow-md animate-pulse">
                        {t.found || "Collected"}
                      </span>
                    </div>
                  ) : (
                    <span className={`${isCJK ? 'font-sans' : 'font-serif'} text-artifact-border text-[1.15rem] leading-relaxed italic opacity-90`}>
                      "{art.clues?.[currentLang] || art.clues?.eng}"
                    </span>
                  )}
                </div>
              ))
            )}
            
          </div>
        </div>
      </div>

    </div>
  );
};

const PinIcon = ({ size }) => (
  <svg className={`${size}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

export default MuseumMap;