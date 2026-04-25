import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const Dashboard = () => {
  const navigate = useNavigate(); // 2. Initialized it here!
  
  // State to manage which tab is currently active (scanner, map, passport)
  const [activeTab, setActiveTab] = useState('scanner');
  // State to simulate a painting being detected
  const [paintingDetected, setPaintingDetected] = useState(false);

  return (
    <div className="relative h-screen w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-hind">
      
      {/* --- MOCK AR SCANNER VIEW --- */}
      {/* Target Brackets */}
      <div className="relative w-64 h-64 border-2 border-transparent">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-artifact-card rounded-tl-xl opacity-70"></div>
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-artifact-card rounded-tr-xl opacity-70"></div>
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-artifact-card rounded-bl-xl opacity-70"></div>
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-artifact-card rounded-br-xl opacity-70"></div>
      </div>

      <button 
        onClick={() => setPaintingDetected(!paintingDetected)}
        className="absolute top-10 text-white opacity-50 underline text-sm"
      >
        Toggle Painting Detection (Dev)
      </button>

      {/* --- PAINTING DETECTED POPUP CARD --- */}
      {paintingDetected && (
        <div className="absolute bottom-32 w-11/12 max-w-sm bg-artifact-bg border-4 border-artifact-border rounded-2xl p-1 shadow-xl animate-fade-in-up z-40">
          <div className="bg-artifact-card rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-daruma text-artifact-border text-2xl">Spoliarium</h3>
              <span className="bg-artifact-border text-white text-xs font-bold px-2 py-1 rounded-full">Base Badge</span>
            </div>
            <p className="text-artifact-border text-xs mb-4">Juan Luna • 1884</p>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-artifact-border text-artifact-card py-2 rounded-full font-daruma tracking-wider text-sm hover:opacity-90">
                View Info
              </button>
              
              <button 
                onClick={() => navigate('/quiz')}
                className="flex-1 bg-white border-2 border-artifact-border text-artifact-border py-2 rounded-full font-daruma tracking-wider text-sm hover:bg-gray-100"
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