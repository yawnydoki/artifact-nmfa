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
    { id: 1, color: 'bg-[#D48A9A]', width: 'w-full', height: 'h-1/3' },
    { id: 2, color: 'bg-[#A3B162]', width: 'w-1/3', height: 'h-full' },
    { id: 3, color: 'bg-[#E5B869]', width: 'w-1/2', height: 'h-full' },
    { id: 4, color: 'bg-[#415C38]', width: 'w-1/6', height: 'h-full' }
  ];

  return (
    <div className="h-[100dvh] w-screen bg-[#617A55] overflow-hidden flex flex-col items-center pt-12 pb-[100px] font-hind-kochi relative box-border">
      
      <div className="w-11/12 max-w-sm mb-4 pl-2 flex-shrink-0">
        <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-white text-3xl tracking-wide`}>
          {t.museumMap || "Museum Map"}
        </h2>
      </div>

      <div className="w-11/12 max-w-sm bg-artifact-card p-3 rounded-2xl shadow-lg border-4 border-artifact-card/50 mb-6 flex-shrink-0">
        <div className="flex flex-col gap-2 h-64">
          
          <div 
            className={`${mapZones[0].width} ${mapZones[0].height} ${mapZones[0].color} rounded-xl flex items-center justify-center cursor-pointer hover:brightness-110 transition-all ${activeZone === 1 ? 'ring-4 ring-white z-10' : ''}`}
            onClick={() => setActiveZone(1)}
          >
             <div className="text-white animate-bounce"><PinIcon size="w-6 h-6" /></div>
          </div>

          <div className="w-full h-2/3 flex gap-2">
            {[1, 2, 3].map(index => (
              <div 
                key={mapZones[index].id}
                className={`${mapZones[index].width} ${mapZones[index].height} ${mapZones[index].color} rounded-xl flex items-center justify-center relative cursor-pointer hover:brightness-110 transition-all ${activeZone === mapZones[index].id ? 'ring-4 ring-white z-10' : ''}`} 
                onClick={() => setActiveZone(mapZones[index].id)}
              >
                <div className="text-white/90 hover:scale-110 transition-transform"><PinIcon size={index === 1 ? 'w-8 h-8' : 'w-6 h-6'} /></div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 flex flex-col min-h-0">
        <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-white text-xl mb-1 ml-2 drop-shadow-sm flex-shrink-0`}>
          {t.clueBehind || "Clues in this Area"}
        </h3>
        
        <div className="bg-[#415C38] p-2 rounded-2xl shadow-xl flex-1 flex flex-col min-h-0">
          <div className="bg-artifact-card rounded-xl p-4 flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3">
            
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-artifact-border font-daruma animate-pulse">
                {t.loading || "Loading clues..."}
              </div>
            ) : !activeZone ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/70 font-hind-kochi">
                {t.selectArea || "Tap a colored room on the map to see the hidden paintings."}
              </div>
            ) : activeClues.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/70 font-hind-kochi">
                {t.areaEmpty || "No paintings in this area."}
              </div>
            ) : (
              activeClues.map((art) => (
                <div key={art.id} className={`p-3 rounded-lg border-2 ${art.isUnlocked ? 'bg-white/80 border-[#4C8C5C]' : 'bg-white/40 border-[#A69B82]'} shadow-sm flex items-start gap-3`}>
                  
                  <div className="mt-1 flex-shrink-0">
                    {art.isUnlocked ? "(checkmark)" : "?"}
                  </div>
                  
                  <div className="flex flex-col">
                    {art.isUnlocked ? (
                      <>
                        <span className={`${isCJK ? 'font-sans font-bold' : 'font-daruma'} text-[#4C8C5C] text-lg leading-tight`}>
                          {art.title?.[currentLang] || art.title?.eng}
                        </span>
                        <span className="text-xs font-bold text-[#4C8C5C]/70 uppercase tracking-wider">{t.found || "Found!"}</span>
                      </>
                    ) : (
                      <span className={`${isCJK ? 'font-sans' : 'font-hind-kochi'} text-artifact-border text-sm leading-snug italic`}>
                        "{art.clues?.[currentLang] || art.clues?.eng}"
                      </span>
                    )}
                  </div>
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
  <svg className={`${size} drop-shadow-md`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default MuseumMap;