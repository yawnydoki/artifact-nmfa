import React, { useState } from 'react';

const MuseumMap = () => {
  // State to hold the currently selected clue
  const [activeClue, setActiveClue] = useState('Please select a pinpoint...');

  // Mock data for our map pins based on your manuscript's requirements
  const pins = [
    { id: 1, color: 'bg-pink-400', clue: 'I am the giant of the hall, where fallen gladiators lie. Seek the canvas that drags the dead, where the spoils of Rome come to die.' },
    { id: 2, color: 'bg-yellow-500', clue: 'Look for the lady holding the flag of freedom.' },
    { id: 3, color: 'bg-green-700', clue: 'Find the quiet landscape painted before the revolution.' },
  ];

  return (
    <div className="h-screen w-screen bg-artifact-green overflow-hidden flex flex-col items-center pt-12 pb-24 font-hind relative">
      
      {/* Header */}
      <div className="w-11/12 max-w-sm mb-4 pl-2">
        <h2 className="font-daruma text-white text-3xl tracking-wide">Museum Map</h2>
      </div>

      {/* --- THE 2D MAP AREA --- */}
      <div className="w-11/12 max-w-sm bg-artifact-card p-3 rounded-2xl shadow-lg border-4 border-artifact-card/50 mb-6">
        {/* Map Grid container */}
        <div className="flex flex-col gap-2 h-64">
          
          {/* Top Zone */}
          <div className="w-full h-1/3 bg-[#D48A9A] rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setActiveClue(pins[0].clue)}>
             {/* Pin Icon */}
             <div className="absolute left-6 text-white animate-bounce">
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
          </div>

          {/* Bottom Zones */}
          <div className="w-full h-2/3 flex gap-2">
            {/* Bottom Left Zone */}
            <div className="w-1/3 h-full bg-[#A3B162] rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setActiveClue(pins[1].clue)}>
              <div className="absolute top-4 left-4 text-white hover:scale-110 transition-transform">
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

            {/* Bottom Center Zone */}
            <div className="w-1/2 h-full bg-[#E5B869] rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setActiveClue('Find the golden harvest under the Philippine sun.')}>
               <div className="text-white hover:scale-110 transition-transform">
                <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

            {/* Bottom Right Zone */}
            <div className="w-1/6 h-full bg-[#415C38] rounded-xl flex items-center justify-center relative cursor-pointer" onClick={() => setActiveClue(pins[2].clue)}>
               <div className="absolute bottom-6 right-2 text-white hover:scale-110 transition-transform">
                <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CLUE/RIDDLE CARD --- */}
      <div className="w-11/12 max-w-sm">
        <h3 className="font-daruma text-white text-xl mb-1 ml-2 drop-shadow-sm">Clue Behind</h3>
        <div className="bg-[#415C38] p-2 rounded-2xl shadow-xl">
          <div className="bg-artifact-card rounded-xl p-6 min-h-[120px] flex items-center justify-center text-center">
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