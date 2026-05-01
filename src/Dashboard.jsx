import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArScanner from './ArScanner';
import { supabase } from './supabaseClient'; // Import your database

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [paintingDetected, setPaintingDetected] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(null); // Holds the database data
  const [isFetching, setIsFetching] = useState(false);

  // This fires the millisecond the camera locks onto a painting
  const handleDetection = async (index) => {
    // Prevent fetching multiple times if the camera is glitching
    if (isFetching || (activeArtwork && activeArtwork.target_index === index)) return;
    
    setIsFetching(true);
    
    try {
      // Query Supabase for this exact painting
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('target_index', index)
        .single(); // We only want one result

      if (error) throw error;
      
      setActiveArtwork(data);
      setPaintingDetected(true);
    } catch (err) {
      console.error("Error fetching artwork:", err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleLoss = () => {
    // Optional: Keep it true if you want the card to stay on screen even if they look away
    // setPaintingDetected(false); 
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center font-hind">
      
      <ArScanner 
        onTargetFound={handleDetection} 
        onTargetLost={handleLoss} 
      />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-transparent pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl opacity-70"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl opacity-70"></div>
      </div>

      <p className="absolute top-12 text-white/80 font-daruma tracking-widest text-lg drop-shadow-md z-10">
        Scan an Artwork
      </p>

      {/* Only show the popup if we detected a painting AND successfully fetched its data */}
      {paintingDetected && activeArtwork && (
        <div className="absolute bottom-32 w-11/12 max-w-sm bg-[#16120c] border-4 border-[#4A2E1B] rounded-2xl p-1 shadow-xl animate-fade-in-up z-40">
          <div className="bg-[#EBDAB5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              {/* Render the actual Title from your JSONB column (defaulting to English) */}
              <h3 className="font-daruma text-[#4A2E1B] text-2xl">{activeArtwork.title.eng}</h3>
              <span className="bg-[#4A2E1B] text-white text-xs font-bold px-2 py-1 rounded-full">Base Badge</span>
            </div>
            
            {/* Render the actual Artist */}
            <p className="text-[#4A2E1B] text-xs mb-4">{activeArtwork.artist.eng}</p>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4A2E1B] text-[#EBDAB5] py-2 rounded-full font-daruma tracking-wider text-sm hover:opacity-90">
                View Info
              </button>
              <button 
                // Pass the artwork data directly to the Quiz Screen via React Router state!
                onClick={() => navigate('/quiz', { state: { artwork: activeArtwork } })}
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