import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const GatepassScreen = ({ onVerify }) => {
  const [error, setError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [camError, setCamError] = useState(false);
  
  const isProcessingRef = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const minDim = Math.min(width, height);
              return { width: Math.floor(minDim * 0.75), height: Math.floor(minDim * 0.75) };
            },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (isProcessingRef.current) return;
            
            isProcessingRef.current = true;
            setIsProcessing(true);
            setError(false);

            try {
              const isPassValid = await onVerify(decodedText);
              
              if (isPassValid) {
                if (html5QrCode.isScanning) {
                  await html5QrCode.stop();
                }
              } else {
                throw new Error("Invalid pass");
              }
            } catch (err) {
              setError(true);
              isProcessingRef.current = false;
              setIsProcessing(false);
              
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
              setTimeout(() => setError(false), 3000);
            }
          },
          (errorMessage) => {
          }
        );
      } catch (err) {
        console.error("Camera failed to start:", err);
        setCamError(true);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(console.error);
      }
    };
  }, [onVerify]);

  return (
    <div className="h-[100dvh] w-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center z-[999] relative overflow-hidden box-border select-none">
      
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-[#E19B2D]/10 to-transparent blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in-up flex flex-col items-center">
        
        <div className="mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 border border-gray-100">
            <svg className="w-7 h-7 text-[#4A260F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h2 className="font-serif text-[#2C2C2C] text-3xl font-medium tracking-tight mb-2">
            Tour Pass
          </h2>
          <p className="font-sans text-gray-500 text-[13px] leading-relaxed max-w-[240px]">
            Please scan the daily entry code located at the entrance.
          </p>
        </div>

        <div className="w-full max-w-[280px] bg-white rounded-[2rem] p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 relative mb-8 group">
          
          <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-[#1A1A1A]">
            
            <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-white/60 z-20 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-white/60 z-20 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-white/60 z-20 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-white/60 z-20 rounded-br-lg pointer-events-none" />
            
            {!camError && (
              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 animate-scan-laser pointer-events-none opacity-50" />
            )}

            <div id="qr-reader" className="w-full h-full object-cover border-none rounded-[1.5rem]"></div>
            
            {camError && (
              <div className="absolute inset-0 bg-[#1A1A1A] flex flex-col items-center justify-center z-30 p-4">
                <p className="text-white text-sm mb-4 font-sans text-center opacity-80">Camera access is required to scan the entrance pass.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-white text-[#1A1A1A] px-6 py-2.5 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full h-[40px] flex items-center justify-center transition-all duration-300">
          {error && (
            <div className="bg-red-50 text-red-600 px-5 py-2.5 rounded-full text-[13px] font-sans font-medium animate-error-shake shadow-sm border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Invalid Pass
            </div>
          )}

          {isProcessing && !error && (
            <div className="text-[#E19B2D] bg-[#E19B2D]/10 px-5 py-2.5 rounded-full text-[13px] font-sans font-medium animate-pulse shadow-sm flex items-center gap-2 border border-[#E19B2D]/20">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Verifying...
            </div>
          )}
          
          {!error && !isProcessing && !camError && (
            <div className="text-gray-400 font-sans text-[12px] tracking-[0.1em] uppercase font-medium">
              Ready to scan
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default GatepassScreen;