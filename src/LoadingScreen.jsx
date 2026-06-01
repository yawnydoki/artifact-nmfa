import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ hasError, isDataReady, onComplete, onRetry }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (hasError) return;
    
    let interval;
    
    if (!isDataReady) {
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) return 90;
          return oldProgress + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);
    } else {

      setProgress(100);
      
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); 
        
      }, 500);

      return () => clearTimeout(fadeTimer);
    }

    return () => clearInterval(interval);
  }, [hasError, isDataReady, onComplete]);

  return (
    <div className={`h-[100dvh] w-screen bg-[#3B1514] flex flex-col items-center justify-center text-[#FDFBF7] transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {!hasError ? (
        <div className="flex flex-col items-center w-full max-w-sm px-6 h-full justify-between py-24 animate-fade-in">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <h1 className="font-serif text-5xl tracking-[0.10em] mb-4">ArtiFact</h1>
            <p className="font-neohellenic text-[0.80rem] tracking-[0.15em] uppercase opacity-90">
              National Museum of Fine Arts
            </p>
          </div>
          
          <div className="w-48 h-[10px] rounded-full border border-white/40 mb-12 p-[1px] relative overflow-hidden">
            <div 
              className="h-full bg-[#FDFBF7] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-fade-in-up">
          <div className="mb-6 border-2 border-current rounded-xl w-10 h-10 flex items-center justify-center">
            <span className="font-arial font-bold text-xl">!</span>
          </div>

          <h2 className="font-serif text-3xl mb-3 tracking-wide">Reconnecting...</h2>
          
          <p className="font-neohellenic text-base opacity-80 mb-8 max-w-[250px] leading-relaxed">
            The connection was interrupted while loading. Please try again.
          </p>

          <button 
            onClick={() => {
              setProgress(0);
              if (onRetry) onRetry(); 
            }}
            className="font-arial bg-[#FDFBF7] text-[#3B1514] font-bold text-sm py-2 px-12 rounded-full hover:opacity-90 active:scale-95 transition-all tracking-wide"
          >
            Retry
          </button>
        </div>
      )}

    </div>
  );
};

export default LoadingScreen;