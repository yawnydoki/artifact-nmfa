import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArScanner from './ArScanner'; // Import our new AR engine!

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State to simulate a painting being detected
  const [paintingDetected, setPaintingDetected] = useState(false);

  // These functions are triggered automatically by MindAR when the camera sees the target
  const handleDetection = () => setPaintingDetected(true);
  const handleLoss = () => setPaintingDetected(false); // Optional: close card if they look away

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center font-hind">
      
      {/* --- THE REAL AR CAMERA FEED --- */}
      <ArScanner 
        onTargetFound={handleDetection} 
        // Uncomment the line below if you want the popup to disappear when looking away
        // onTargetLost={handleLoss} 
      />

      {/* --- MOCK UI OVERLAY --- */}
      {/* Target Brackets to guide the user's camera */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-transparent pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl opacity-70"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl opacity-70"></div>
      </div>

      <p className="absolute top-12 text-white/80 font-daruma tracking-widest text-lg drop-shadow-md z-10">
        Scan an Artwork
      </p>

      {/* --- PAINTING DETECTED POPUP CARD --- */}
      {paintingDetected && (
        <div className="absolute bottom-32 w-11/12 max-w-sm bg-[#16120c] border-4 border-[#4A2E1B] rounded-2xl p-1 shadow-xl animate-fade-in-up z-40">
          <div className="bg-[#EBDAB5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-daruma text-[#4A2E1B] text-2xl">Spoliarium</h3>
              <span className="bg-[#4A2E1B] text-white text-xs font-bold px-2 py-1 rounded-full">Base Badge</span>
            </div>
            <p className="text-[#4A2E1B] text-xs mb-4">Juan Luna • 1884</p>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4A2E1B] text-[#EBDAB5] py-2 rounded-full font-daruma tracking-wider text-sm hover:opacity-90">
                View Info
              </button>
              <button 
                onClick={() => navigate('/quiz')}
                className="flex-1 bg-white border-2 border-[#4A2E1B] text-[#4A2E1B] py-2 rounded-full font-daruma tracking-wider text-sm hover:bg-gray-100"
              >
                Start Quiz!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;