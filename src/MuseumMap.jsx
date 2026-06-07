import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useTranslation } from 'react-i18next';
import { useData } from './DataContext';

const MuseumMap = () => {
  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  
  const isCJK = ['chi', 'jap', 'kor'].includes(currentLang);

  const [activeZone, setActiveZone] = useState(null); 
  const [isExpanded, setIsExpanded] = useState(false); 

  const { artworks, unlockedBadges, isDataLoading } = useData();

  const mergedArtworks = artworks.map(artwork => ({
    ...artwork,
    isUnlocked: unlockedBadges.some(b => b.artwork_id === artwork.id)
  }));

  const activeClues = mergedArtworks.filter(art => art.zone === activeZone);

  const mapZones = {
    green: { id: 2, hex: '#9AB053' },    
    purple: { id: 1, hex: '#C973A4' }, 
    orange: { id: 3, hex: '#FA9E59' },   
    darkGreen: { id: 4, hex: '#165C3B' } 
  };

  const boldCapitalWords = (text) => {
  return text.replace(/\b([A-Z]{2,})\b/g, '<strong class="font-bold">$1</strong>');
  };

  const galleryNames = {
    [mapZones.green.id]: boldCapitalWords(t("This section is found in GALLERY VIII")),
    [mapZones.purple.id]: boldCapitalWords(t("This section is found in GALLERY VI")),
    [mapZones.orange.id]: boldCapitalWords(t("This section is found in HALL OF MASTERS")),
    [mapZones.darkGreen.id]: boldCapitalWords(t("This section is found in GALLERY III"))
  };

  return (
    <div className="h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center pt-6 pb-[100px] relative box-border transition-colors duration-500">
      
      <div className={`w-11/12 max-w-sm mb-2 pl-2 flex-shrink-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-white text-3xl tracking-wide`}>
          {t("Museum Map")}
        </h2>
      </div>

      <div className={`w-11/12 max-w-sm flex-shrink-0 flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-0 opacity-0 mb-0' : 'max-h-[70vh] opacity-100 mb-3'}`}>
        
        <div className="w-full flex flex-col items-center mb-2.5 text-center font-serif flex-shrink-0">
          <div className="w-full bg-[#E8D1B5] border-2 border-[#240B06] rounded-2xl py-2 px-4 shadow-md flex flex-col items-center text-[#240B06]">
            <span className="text-[0.9rem] font-medium tracking-wide mb-1">{t("Color Codes:")}</span>
            <div className="flex gap-6 text-[0.8rem]">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-[#755D50] rounded-sm"></div>
                <span>{t("Other Rooms")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-[#875e47] rounded-sm"></div>
                <span>{t("Hallway")}</span>
              </div>
            </div>
          </div>
          <p className="text-white text-[11px] opacity-90 tracking-wide leading-tight mt-1.5 px-2">
            {t("Colored Rooms have Unlockable paintings.")}<br />
            {t("Current paintings are only found within the second floor")}
          </p>
        </div>
        
        <div className="w-full bg-[#32130C] p-3 rounded-[2rem] border-4 border-[#240B06] shadow-2xl h-64 sm:h-72 relative overflow-hidden box-border flex-shrink-0">
          <div className="w-full h-full bg-[#E8D1B5] rounded-[1.2rem] p-2.5 flex flex-col justify-between relative box-border">
            
            <div className="w-full h-[18%] flex gap-[3%] relative">
              <button 
                onClick={() => setActiveZone(mapZones.green.id)}
                className={`w-[22%] h-full rounded-sm flex items-center justify-center transition-all relative ${activeZone === mapZones.green.id ? 'ring-4 ring-white z-10' : 'hover:brightness-110'}`}
                style={{ backgroundColor: mapZones.green.hex }}
              >
                <PinIcon className={`text-white drop-shadow-md w-5 h-5 transition-transform ${activeZone === mapZones.green.id ? 'animate-bounce' : ''}`} />
              </button>
              
              <div className="w-[14%] h-full bg-[#755D50] rounded-sm"></div>
              <div className="w-[24%] h-full bg-[#755D50] rounded-sm"></div>
              
              <button 
                onClick={() => setActiveZone(mapZones.purple.id)}
                className={`w-[22%] h-full rounded-sm flex items-center justify-center transition-all relative ${activeZone === mapZones.purple.id ? 'ring-4 ring-white z-10' : 'hover:brightness-110'}`}
                style={{ backgroundColor: mapZones.purple.hex }}
              >
                <PinIcon className={`text-white drop-shadow-md w-5 h-5 transition-transform ${activeZone === mapZones.purple.id ? 'animate-bounce' : ''}`} />
              </button>
              
              <div className="w-[11%] h-full bg-[#755D50] rounded-sm"></div>
            </div>

            <div className="w-full h-[12%] bg-[#875e47] my-[1%] rounded-sm flex items-center justify-center">
              <span className="text-[#E8D1B5] font-serif text-sm tracking-wide select-none">
                {t("Hallway")}
              </span>
            </div>

            <div className="w-full h-[53%] flex justify-between relative">
              <div className="w-[9%] h-full bg-[#755D50] rounded-sm"></div>
              <div className="w-[9%] h-full bg-[#875e47] rounded-sm"></div>
              <div className="w-[12%] h-full bg-[#755D50] rounded-sm"></div>
              
              <button 
                onClick={() => setActiveZone(mapZones.orange.id)}
                className={`w-[28%] h-full rounded-sm flex items-center justify-center transition-all relative ${activeZone === mapZones.orange.id ? 'ring-4 ring-white z-10' : 'hover:brightness-110'}`}
                style={{ backgroundColor: mapZones.orange.hex }}
              >
                <PinIcon className={`text-white drop-shadow-md w-6 h-6 transition-transform ${activeZone === mapZones.orange.id ? 'animate-bounce' : ''}`} />
              </button>

              <button 
                onClick={() => setActiveZone(mapZones.darkGreen.id)}
                className={`w-[14%] h-full rounded-sm flex items-center justify-center transition-all relative ${activeZone === mapZones.darkGreen.id ? 'ring-4 ring-white z-10' : 'hover:brightness-110'}`}
                style={{ backgroundColor: mapZones.darkGreen.hex }}
              >
                <PinIcon className={`text-white drop-shadow-md w-5 h-5 transition-transform ${activeZone === mapZones.darkGreen.id ? 'animate-bounce' : ''}`} />
              </button>

              <div className="w-[9%] h-full bg-[#875e47] rounded-sm"></div> 
              <div className="w-[10%] h-full bg-[#755D50] rounded-sm"></div>
            </div>

            <div className="w-full h-[13%] bg-[#875e47] mt-[1%] rounded-sm flex items-center justify-center">
              <span className="text-[#E8D1B5] font-serif text-sm tracking-wide select-none">
                {t("Entrance")}
              </span>
            </div>

          </div>
        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 min-h-[160px] flex flex-col box-border min-w-0">
        
        <div className="flex justify-between items-end mb-2.5 px-2 flex-shrink-0">
          <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-white text-[1.1rem] drop-shadow-sm`}>
            {t("Clues in the selected area")}
          </h3>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-museum-gold text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-0.5 hover:brightness-110 transition-all bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md flex-shrink-0"
          >
            {isExpanded ? t("Hide") : t("Expand")}
            <svg 
              className={`w-3 h-3 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div className="bg-[#1D0C09] p-3 rounded-[2rem] shadow-2xl flex-1 flex flex-col min-h-0 border border-white/5 overflow-hidden">
          <div className="bg-artifact-card rounded-[1.4rem] p-4 flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4">
            
            {activeZone && (
              <div className="text-center mb-1">
                <span 
                  className="text-artifact-border text-[15px] font-serif"
                  dangerouslySetInnerHTML={{ __html: galleryNames[activeZone] }}
                />
              </div>
            )}
                        
            {isDataLoading ? (
              <div className="flex-1 flex items-center justify-center text-artifact-border font-serif animate-pulse text-base italic">
                {t("Accessing archives...")}
              </div>
            ) : !activeZone ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/60 font-serif italic p-4 text-sm leading-relaxed">
                {t("Select a colored wing on the map to reveal the hidden masterpieces.")}
              </div>
            ) : activeClues.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-artifact-border/60 font-serif italic text-sm">
                {t("This gallery currently holds no secrets.")}
              </div>
            ) : (
              activeClues.map((art) => (
                <div 
                  key={art.id} 
                  className="p-5 rounded-2xl border border-artifact-border/30 bg-artifact-card/40 shadow-sm flex flex-col items-center justify-center text-center flex-shrink-0 min-h-[90px] h-auto animate-fade-in-up"
                >
                  {art.isUnlocked ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                      <span className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-artifact-border text-lg leading-snug tracking-tight break-words max-w-full`}>
                        {art.title?.[currentLang] || art.title?.eng}
                      </span>
                      <span className="bg-[#3E5D36] text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-md">
                        {t("Collected")}
                      </span>
                    </div>
                  ) : (
                    <span className={`${isCJK ? 'font-sans' : 'font-serif'} text-artifact-border text-[0.95rem] leading-relaxed italic opacity-90 break-words max-w-full`}>
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

const PinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

export default MuseumMap;