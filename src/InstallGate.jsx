import React, { useState, useEffect } from 'react';

const InstallGate = ({ children }) => {
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const checkStandalone = () => {
      return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    };
    setIsStandalone(checkStandalone());

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/ipad|iphone|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone) {
    return children;
  }

  return (
    <div className="fixed inset-0 bg-[#16120c] z-[100] flex flex-col items-center justify-center p-6 text-center font-daruma">
      <h1 className="text-[#EBDAB5] text-4xl mb-4">Welcome to ArtiFact</h1>
      <p className="text-white text-lg font-hind mb-8">
        To use the AR Scanner, you must install this app to your device.
      </p>

      {isIos ? (
        <div className="bg-white/10 p-6 rounded-2xl border-2 border-[#C9B99A]">
          <p className="text-white font-hind mb-4">
            <strong>iOS Instructions:</strong>
          </p>
          <ol className="text-left text-white font-hind space-y-3">
            <li>1. Tap the <strong>Share</strong> button <span className="inline-block border border-white px-1 rounded pb-1">⎙</span> at the bottom of Safari.</li>
            <li>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            <li>3. Open the new ArtiFact app from your home screen!</li>
          </ol>
        </div>
      ) : (
        <button 
          onClick={handleInstallClick}
          className="bg-[#C9B99A] text-[#16120c] text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:bg-white transition"
        >
          Install AR App
        </button>
      )}
    </div>
  );
};

export default InstallGate;