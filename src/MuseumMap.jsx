import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { uiDict } from './translations';

const MuseumMap = () => {
  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;

  const [activeClue, setActiveClue] = useState('Please select a pinpoint...');

  const pins = [
    { 
      id: 1, 
      color: 'bg-[#D48A9A]', 
      clue: {
        eng: 'I am the giant of the hall, where fallen gladiators lie. Seek the canvas that drags the dead, where the spoils of Rome come to die.',
        tag: 'Ako ang higante ng bulwagan, kung saan nakaratay ang mga bumagsak na gladiator. Hanapin ang canvas na kumakaladkad sa mga patay...',
      }
    },
    { 
      id: 2, 
      color: 'bg-[#A3B162]', 
      clue: {
        eng: 'Look for the lady holding the flag of freedom.',
        tag: 'Hanapin ang ginang na may hawak na watawat ng kalayaan.',
      }
    },
    { 
      id: 3, 
      color: 'bg-[#415C38]', 
      clue: {
        eng: 'Find the quiet landscape painted before the revolution.',
        tag: 'Hanapin ang tahimik na tanawin na ipininta bago ang rebolusyon.',
      }
    },
  ];

  return (
    <div className="h-[100dvh] w-screen bg-[#617A55] overflow-hidden flex flex-col items-center pt-12 pb-[100px] font-hind relative box-border">
      
      <div className="w-11/12 max-w-sm mb-4 pl-2 flex-shrink-0">
        <h2 className="font-daruma text-white text-3xl tracking-wide">{t.museumMap || "Museum Map"}</h2>
      </div>

      <div className="w-11/12 max-w-sm bg-artifact-card p-3 rounded-2xl shadow-lg border-4 border-artifact-card/50 mb-6 flex-shrink-0">
        <div className="flex flex-col gap-2 h-64">
          
          <div 
            className={`w-full h-1/3 ${pins[0].color} rounded-xl flex items-center justify-center relative cursor-pointer hover:brightness-110`} 
            onClick={() => setActiveClue(pins[0].clue[currentLang] || pins[0].clue.eng)}
          >
             <div className="absolute left-6 text-white animate-bounce">
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
          </div>

          <div className="w-full h-2/3 flex gap-2">
            
            <div 
              className={`w-1/3 h-full ${pins[1].color} rounded-xl flex items-center justify-center relative cursor-pointer hover:brightness-110`} 
              onClick={() => setActiveClue(pins[1].clue[currentLang] || pins[1].clue.eng)}
            >
              <div className="absolute top-4 left-4 text-white hover:scale-110 transition-transform">
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

            <div 
              className="w-1/2 h-full bg-[#E5B869] rounded-xl flex items-center justify-center relative cursor-pointer hover:brightness-110" 
              onClick={() => setActiveClue(currentLang === 'tag' ? 'Humanap ng iba pang ginto.' : 'Keep exploring to find more clues.')}
            >
               <div className="text-white/70 hover:scale-110 transition-transform">
                <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

            <div 
              className={`w-1/6 h-full ${pins[2].color} rounded-xl flex items-center justify-center relative cursor-pointer hover:brightness-110`} 
              onClick={() => setActiveClue(pins[2].clue[currentLang] || pins[2].clue.eng)}
            >
               <div className="absolute bottom-6 right-2 text-white hover:scale-110 transition-transform">
                <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-11/12 max-w-sm flex-1 flex flex-col min-h-0">
        <h3 className="font-daruma text-white text-xl mb-1 ml-2 drop-shadow-sm flex-shrink-0">
          {t.clueBehind || "Clue Behind"}
        </h3>
        <div className="bg-[#415C38] p-2 rounded-2xl shadow-xl flex-1 flex flex-col">
          <div className="bg-artifact-card rounded-xl p-6 flex-1 overflow-y-auto flex items-center justify-center text-center">
            <p className="font-daruma text-artifact-border text-lg leading-snug">
              {activeClue}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MuseumMap;