import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';

const Certificate = () => {
  const navigate = useNavigate();
  const { unlockedBadges } = useData();
  
  const [visitorName, setVisitorName] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalBadges = unlockedBadges?.length || 0;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (visitorName.trim() !== "") {
      setIsGenerated(true);
    }
  };

  const nextSlide = () => {
    if (currentSlide < 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className={`h-[100dvh] w-screen overflow-hidden flex flex-col items-center justify-center relative box-border transition-colors duration-500 ${isGenerated ? 'bg-[#3b1212]' : 'bg-[#16120c] p-4'}`}>
      
      {!isGenerated ? (
        <div className="w-full flex flex-col items-center z-10 animate-fade-in-up mt-[-10vh]">
          <h1 className="font-serif text-[#F5EAD4] text-[2.5rem] tracking-wide mb-6 drop-shadow-md">
            Congratulations!
          </h1>
          
          <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl mb-4">
            <div className="bg-[#E0CCB6] rounded-xl pt-6 pb-8 px-6 flex flex-col items-center text-center">
              
              <p className="font-serif text-[#4A260F] text-[1.15rem] leading-snug mb-8">
                To claim your certificate please enter your 'alias' for your appreciation.
              </p>
              
              <form onSubmit={handleGenerate} className="w-full flex flex-col items-center gap-8">
                <input 
                  type="text" 
                  placeholder="Type Any Name Here..." 
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#4A260F]/60 text-center font-serif text-[#4A260F] text-lg pb-2 placeholder:text-[#4A260F]/50 focus:outline-none focus:border-[#4A260F] transition-colors"
                  required
                />
                <button 
                  type="submit"
                  className="bg-[#E0CCB6] border-2 border-[#4A260F] text-[#4A260F] rounded-lg px-8 py-2 font-serif text-[1.15rem] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[#4A260F]/5 active:scale-95 transition-all"
                >
                  Redeem Prize
                </button>
              </form>
            </div>
          </div>

          <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl">
            <div className="bg-[#E0CCB6] rounded-xl py-4 px-5 text-center">
              <p className="font-serif text-[#4A260F] text-[1.05rem] leading-tight">
                Note: All gold badges to get a special prize from us! We'll be by the entrance!
              </p>
            </div>
          </div>
        </div>

      ) : (
        
        <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in">
          
          <button 
            onClick={() => navigate('/end')}
            className="absolute top-6 right-6 text-white text-2xl font-serif hover:scale-110 transition-transform z-50"
          >
            X
          </button>

          {currentSlide === 0 && (
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50 hover:scale-110 transition-transform p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {currentSlide === 1 && (
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50 hover:scale-110 transition-transform p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-[90%] max-w-[400px]aspect-auto">
            
            <img 
              src="/Group 45.svg" 
              alt="Certificate Border" 
              className="w-full h-full object-contain"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-[15%]">
              
              <div className="-mb-2 flex flex-col items-center w-full">
                <img 
                  src="/logo_red.png" 
                  alt="ArtiFact Logo" 
                  className="w-[15%] object-contain mb-[-5%]"
                />
              </div>

              <h1 className="font-agbalumo text-[#7A1515] leading-none mb-1" style={{ fontSize: "clamp(1.5rem, 6vw, 2.75rem)" }}>
                Certificate
              </h1>
              <h2 className="font-agbalumo text-[#7A1515] leading-none mb-3" style={{ fontSize: "clamp(1rem, 4vw, 1.75rem)" }}>
                of Appreciation
              </h2>

              <div className="w-1/2 border-t border-[#7A1515]/40 mb-2"></div>

              <h3 className="font-birthstone text-[#7A1515] leading-none mb-2 break-all text-center" style={{ fontSize: "clamp(2rem, 12vw, 5rem)" }}>
                {visitorName}
              </h3>

              <div className="w-1/4 border-t border-[#7A1515]/40 mb-2"></div>

              <h4 className="font-agbalumo text-[#7A1515]" style={{ fontSize: "clamp(0.8rem, 4vw, 1.5rem)" }}>
                “ArtiFact Explorer”
              </h4>
              <p className="font-serif text-[#7A1515] font-bold tracking-widest mb-2" style={{ fontSize: "clamp(0.4rem, 2vw, 0.6rem)" }}>
                at the National Museum of Fine Arts
              </p>

              <div className="w-2/3 flex-col flex items-center justify-center overflow-hidden">
                {currentSlide === 0 ? (
                  <p className="font-lora text-[#7A1515]/90 text-justify leading-snug px-1" style={{ fontSize: "clamp(0.6rem, 2.5vw, 0.85rem)" }}>
                    Congratulations on unlocking all badges! Thank you for testing ArtiFact and participating in our thesis project. Your time, support, and valuable feedback have greatly contributed to our research. We sincerely appreciate your participation.
                  </p>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="grid grid-cols-5 gap-3 mb-4 w-full px-2">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-full flex items-center justify-center shadow-inner ${
                            i < totalBadges ? 'bg-[#AA8855]' : 'bg-[#AA8855]/40'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="font-agbalumo text-[#7A1515]" style={{ fontSize: "clamp(0.8rem, 4vw, 1.2rem)" }}>
                      {totalBadges} Badges Collected
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="absolute bottom-8 w-full flex flex-col items-center justify-center">
            
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setCurrentSlide(0)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === 0 ? 'w-10 bg-white' : 'w-10 bg-white/30 hover:bg-white/50'}`}
              />
              <button 
                onClick={() => setCurrentSlide(1)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === 1 ? 'w-10 bg-white' : 'w-10 bg-white/30 hover:bg-white/50'}`}
              />
            </div>
            
            <button className="absolute right-6 bottom-0 text-white hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Certificate;