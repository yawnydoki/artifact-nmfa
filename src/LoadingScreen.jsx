import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  // Set to true to see the "Reconnecting" screen, false for the "Loading" screen
  const [hasError, setHasError] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    if (hasError) return;
    
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [hasError]);

  return (
    <div className="h-screen w-screen bg-artifact-bg flex flex-col items-center justify-center text-white font-arial">
      
      {!hasError ? (
        /* --- STATE 1: LOADING SCREEN --- */
        <div className="flex flex-col items-center w-full max-w-sm px-6 h-full justify-between py-24">
          <div className="flex-grow flex flex-col justify-center items-center">
            <h1 className="font-daruma text-5xl tracking-widest mb-2">ArtiFact</h1>
            <p className="text-xs tracking-wide text-gray-300">National Museum of Fine Arts</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 h-2 rounded-full border border-gray-400 overflow-hidden mb-12">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        /* --- STATE 2: RECONNECTING (ERROR) SCREEN --- */
        <div className="flex flex-col items-center w-full max-w-sm px-6 text-center">
          {/* Alert Icon (SVG) */}
          <div className="mb-6 border-2 border-white rounded-[10px] w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-lg font-arial">!</span>
          </div>

          <h2 className="font-daruma text-3xl mb-3 tracking-wider">Reconnecting...</h2>
          <p className="text-xs text-gray-300 mb-8 max-w-[200px] leading-relaxed">
            The connection was interrupted while loading. Please try again.
          </p>

          <button 
            onClick={() => {
              setHasError(false);
              setProgress(0);
            }}
            className="bg-white text-black font-bold text-xs py-2 px-10 rounded-full hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

    </div>
  );
};

export default LoadingScreen;