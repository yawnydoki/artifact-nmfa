import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (hasError) return;
    
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [hasError]);

  return (
    <div className="h-[100dvh] w-screen bg-[#3B1514] flex flex-col items-center justify-center text-[#FDFBF7]">
      
      {!hasError ? (
        <div className="flex flex-col items-center w-full max-w-sm px-6 h-full justify-between py-24 animate-fade-in">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <h1 className="font-serif text-5xl tracking-[0.10em] mb-4">ArtiFact</h1>
            <p className="font-neohellenic text-[0.80rem] tracking-[0.15em] uppercase opacity-90">
              National Museum of Fine Arts
            </p>
          </div>
          
          <div className="w-48 h-[10px] rounded-full border border-white/40 mb-12 p-[1px]">
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
              setHasError(false);
              setProgress(0);
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