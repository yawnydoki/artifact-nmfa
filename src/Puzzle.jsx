import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient.js";  

const GRID_SIZE = 3;
const EMPTY_TILE = GRID_SIZE * GRID_SIZE - 1;

const Puzzle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const artwork = location.state?.artwork;

  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSavingBadge, setIsSavingBadge] = useState(false);

  const hasQuiz = artwork?.q1?.eng?.question?.trim().length > 0;
  const earnedBadgeType = hasQuiz ? "Silver" : "Gold";

  const isSolvable = (arr) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== EMPTY_TILE && arr[j] !== EMPTY_TILE && arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const initPuzzle = useCallback(() => {
    let newTiles = [...Array(GRID_SIZE * GRID_SIZE).keys()];
    do {
      newTiles.sort(() => Math.random() - 0.5);
    } while (!isSolvable(newTiles) || newTiles[EMPTY_TILE] === EMPTY_TILE); 

    setTiles(newTiles);
    setIsSolved(false);
    setShowOverlay(false);
  }, []);

  useEffect(() => {
    if (!artwork) {
      navigate(-1);
      return;
    }
    initPuzzle();
  }, [artwork, initPuzzle, navigate]);

  const handleTileClick = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    
    const isAdjacent =
      (index === emptyIndex - 1 && emptyIndex % GRID_SIZE !== 0) || 
      (index === emptyIndex + 1 && index % GRID_SIZE !== 0) || 
      (index === emptyIndex - GRID_SIZE) || 
      (index === emptyIndex + GRID_SIZE); 

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      if (newTiles.every((val, i) => val === i)) {
        setIsSolved(true); 
        
        setTimeout(() => {
          setShowOverlay(true);
          handleWin();
        }, 1500);
      }
    }
  };

  const handleWin = async () => {
    setIsSavingBadge(true);
    try {
      const visitorId = localStorage.getItem("artifact_visitor_id");
      
      if (!visitorId) {
        console.error("No visitor ID found. Cannot save badge.");
        return;
      }

      const { error } = await supabase
        .from("unlocked_badges")
        .upsert({
          visitor_id: visitorId,
          artwork_id: artwork.id,
          badge_type: earnedBadgeType
        }, { onConflict: "visitor_id,artwork_id" });

      if (error) throw error;
      
      console.log(`${earnedBadgeType} Badge Unlocked successfully!`);
    } catch (error) {
      console.error("Error saving badge:", error.message);
    } finally {
      setIsSavingBadge(false);
    }
  };

  if (!artwork) return null;

  const imageUrl = artwork.thumbnail_url;
  const badgeImgSrc = artwork.badge_url || "/logo_trans.png"; 

  return (
    <div className="absolute inset-0 flex flex-col items-center bg-[#3A1414] text-[#E4CBAF] font-serif overflow-hidden pt-8 px-4">
      
      <div className="w-full flex justify-between items-start z-20 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full hover:bg-black/50 transition-all shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5 text-[#E4CBAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-sans font-bold text-sm uppercase tracking-wider text-[#E4CBAF]">Exit Puzzle</span>
        </button>
      </div>

      <h1 className="text-4xl text-center mb-8 leading-tight drop-shadow-md">
        Piece it<br />Together!
      </h1>

      <div className="w-full max-w-sm aspect-square bg-[#E8D2B8] p-1 rounded border-2 border-[#E4CBAF] relative shadow-2xl overflow-hidden">
        
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[2px] bg-[#2D120E] relative">
          {tiles.map((tileValue, index) => {
            const isEmpty = tileValue === EMPTY_TILE;
            
            const xPos = (tileValue % GRID_SIZE) * 50; 
            const yPos = Math.floor(tileValue / GRID_SIZE) * 50;

            return (
              <div
                key={index}
                onClick={() => handleTileClick(index)}
                className={`w-full h-full relative ${
                  isEmpty ? "bg-[#2D120E] cursor-default" : "cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
                }`}
                style={{
                  backgroundImage: !isEmpty ? `url(${imageUrl})` : "none",
                  backgroundSize: "300% 300%",
                  backgroundPosition: `${xPos}% ${yPos}%`,
                }}
              >
                {isEmpty && !isSolved && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 opacity-40">
                    <img 
                      src="/logo_trans.png" 
                      alt="Empty Tile" 
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {isSolved && (
             <div 
               className="absolute inset-0 z-0 bg-cover bg-center animate-fade-in"
               style={{ backgroundImage: `url(${imageUrl})` }}
             />
          )}
        </div>

        {showOverlay && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded backdrop-blur-sm animate-fade-in z-10">
            
            <div className="w-28 h-28 mb-4 flex items-center justify-center drop-shadow-2xl">
               <img 
                 src={badgeImgSrc} 
                 alt={`${earnedBadgeType} Badge`} 
                 className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.src = "/logo_trans.png"; 
                 }}
               />
            </div>

            <h2 className="text-3xl font-bold text-gray-200 mb-1 drop-shadow-lg text-center">Masterclass!!</h2>
            <p className="text-gray-300 text-sm mb-6 uppercase tracking-widest font-sans font-bold">
              {earnedBadgeType} Badge Earned
            </p>
            <button 
              onClick={() => navigate(-1)} 
              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-sans font-bold uppercase tracking-wider rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              disabled={isSavingBadge}
            >
              {isSavingBadge ? "Saving..." : "Claim Badge"}
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl text-center mt-8 italic text-[#E4CBAF]/80">
        "{artwork.title?.eng || "Unknown Artwork"}"
      </h3>
    </div>
  );
};

export default Puzzle;