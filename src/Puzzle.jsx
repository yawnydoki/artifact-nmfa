import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient.js";  
import { useData } from "./DataContext";
import {
  isLocalLeaderboardEnabled,
  saveLocalLeaderboardEntry,
} from "./localLeaderboard";

const GRID_SIZE = 3;
const EMPTY_TILE = GRID_SIZE * GRID_SIZE - 1;
const HINT_PROMPT_DELAY_SECONDS = 30;

const formatElapsedTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const solvePuzzleForTesting = () => {
  const grid = document.querySelector("div.grid.grid-cols-3.grid-rows-3");
  if (!grid) throw new Error("Open the puzzle screen first.");

  const cells = [...grid.children].slice(0, 9);
  if (cells.length !== 9) throw new Error("Puzzle board is not ready.");

  const startState = cells.map((cell) => {
    if (cell.querySelector('img[alt="Empty Tile"]')) return 8;

    const positions = (
      cell.style.backgroundPosition.match(/-?\d+(?:\.\d+)?/g) || []
    ).map(Number);
    return Math.round(positions[0] / 50) + Math.round(positions[1] / 50) * 3;
  });

  const stateKey = (state) => state.join(",");
  const heuristic = (state) =>
    state.reduce((total, value, index) => {
      if (value === 8) return total;
      return (
        total +
        Math.abs(Math.floor(value / 3) - Math.floor(index / 3)) +
        Math.abs((value % 3) - (index % 3))
      );
    }, 0);

  const goal = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const open = [{ state: startState, cost: 0, moves: [] }];
  const bestCosts = new Map([[stateKey(startState), 0]]);
  let solution = null;

  while (open.length) {
    open.sort(
      (a, b) =>
        a.cost + heuristic(a.state) - (b.cost + heuristic(b.state)),
    );

    const current = open.shift();
    if (stateKey(current.state) === stateKey(goal)) {
      solution = current.moves;
      break;
    }

    const emptyIndex = current.state.indexOf(8);
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    for (const [rowOffset, colOffset] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow < 0 || nextRow > 2 || nextCol < 0 || nextCol > 2) continue;

      const tileIndex = nextRow * 3 + nextCol;
      const nextState = [...current.state];
      [nextState[emptyIndex], nextState[tileIndex]] = [
        nextState[tileIndex],
        nextState[emptyIndex],
      ];

      const nextCost = current.cost + 1;
      const nextKey = stateKey(nextState);
      if (!bestCosts.has(nextKey) || nextCost < bestCosts.get(nextKey)) {
        bestCosts.set(nextKey, nextCost);
        open.push({
          state: nextState,
          cost: nextCost,
          moves: [...current.moves, tileIndex],
        });
      }
    }
  }

  if (!solution) throw new Error("Could not solve this puzzle.");

  solution.forEach((cellIndex, moveIndex) => {
    window.setTimeout(() => cells[cellIndex].click(), moveIndex * 180);
  });

  console.info(`Solving puzzle in ${solution.length} moves...`);
  return solution.length;
};

const Puzzle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const artwork = location.state?.artwork;
  const { refreshBadges } = useData();

  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSavingBadge, setIsSavingBadge] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [showReference, setShowReference] = useState(false);
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [showHintPrompt, setShowHintPrompt] = useState(false);

  const timerStartRef = useRef(null);
  const completionTimeoutRef = useRef(null);
  const nameInputRef = useRef(null);

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
    setElapsedSeconds(0);
    setPlayerName("");
    setNameError("");
    setShowReference(false);
    setShowStartPrompt(true);
    setShowHintPrompt(false);
    setHasStarted(false);
    timerStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!artwork) {
      navigate(-1);
      return;
    }
    initPuzzle();
  }, [artwork, initPuzzle, navigate]);

  useEffect(() => {
    if (!hasStarted || !timerStartRef.current || isSolved) return undefined;

    const timerId = window.setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - timerStartRef.current) / 1000),
      );
    }, 250);

    return () => window.clearInterval(timerId);
  }, [hasStarted, isSolved, tiles.length]);

  useEffect(() => {
    if (!hasStarted || !timerStartRef.current || isSolved || showReference) {
      return undefined;
    }

    const hintTimer = window.setTimeout(() => {
      setShowHintPrompt(true);
    }, HINT_PROMPT_DELAY_SECONDS * 1000);

    return () => window.clearTimeout(hintTimer);
  }, [hasStarted, isSolved, showReference, tiles.length]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showOverlay && !isSavingBadge) {
      nameInputRef.current?.focus();
    }
  }, [showOverlay, isSavingBadge]);

  useEffect(() => {
    window.solvePuzzleForTesting = solvePuzzleForTesting;
    return () => {
      delete window.solvePuzzleForTesting;
    };
  }, []);

  const handleTileClick = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    
    const isAdjacent =
      (index === emptyIndex - 1 && emptyIndex % GRID_SIZE !== 0) || 
      (index === emptyIndex + 1 && index % GRID_SIZE !== 0) || 
      (index === emptyIndex - GRID_SIZE) || 
      (index === emptyIndex + GRID_SIZE); 

    if (isAdjacent) {
      if (!timerStartRef.current) {
        timerStartRef.current = Date.now();
        setHasStarted(true);
        setShowHintPrompt(false);
      }

      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      if (newTiles.every((val, i) => val === i)) {
        const completedTime = Math.floor(
          (Date.now() - timerStartRef.current) / 1000,
        );

        setElapsedSeconds(completedTime);
        setIsSolved(true);

        completionTimeoutRef.current = window.setTimeout(() => {
          setShowOverlay(true);
        }, 1500);
      }
    }
  };

  const savePuzzleTime = async (visitorId, completedTime, completedBy) => {
    const timeData = {
      id: uuidv4(),
      visitor_id: visitorId,
      artwork_id: artwork.id,
      elapsed_seconds: completedTime,
      player_name: completedBy,
      completed_at: new Date().toISOString(),
    };

    if (isLocalLeaderboardEnabled) {
      await saveLocalLeaderboardEntry(timeData);
      return;
    }

    const timeQueue = JSON.parse(
      localStorage.getItem("artifact_puzzle_time_queue") || "[]",
    );
    timeQueue.push(timeData);
    localStorage.setItem(
      "artifact_puzzle_time_queue",
      JSON.stringify(timeQueue),
    );

    try {
      const { error } = await supabase
        .from("puzzle_times")
        .insert(timeData);

      if (error && error.code !== "23505") throw error;

      const remainingQueue = JSON.parse(
        localStorage.getItem("artifact_puzzle_time_queue") || "[]",
      ).filter((entry) => entry.id !== timeData.id);
      localStorage.setItem(
        "artifact_puzzle_time_queue",
        JSON.stringify(remainingQueue),
      );
    } catch (error) {
      console.warn(
        "Puzzle time saved locally and will sync when online.",
        error.message,
      );
    }
  };

  const handleWin = async (completedTime, completedBy) => {
    setIsSavingBadge(true);
    try {
      const visitorId = localStorage.getItem("artifact_visitor_id");
      
      if (!visitorId) {
        console.error("No visitor ID found. Cannot save badge.");
        return;
      }

      await savePuzzleTime(visitorId, completedTime, completedBy);

      const badgeData = {
        visitor_id: visitorId,
        artwork_id: artwork.id,
        badge_type: earnedBadgeType,
        created_at: new Date().toISOString(),
      };
      const cachedBadges = JSON.parse(
        localStorage.getItem("artifact_cached_badges") || "[]",
      );
      const cachedBadgeIndex = cachedBadges.findIndex(
        (badge) => badge.artwork_id === artwork.id,
      );
      if (cachedBadgeIndex >= 0) {
        cachedBadges[cachedBadgeIndex] = {
          ...cachedBadges[cachedBadgeIndex],
          ...badgeData,
        };
      } else {
        cachedBadges.push(badgeData);
      }
      localStorage.setItem(
        "artifact_cached_badges",
        JSON.stringify(cachedBadges),
      );

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
      await refreshBadges();
      setIsSavingBadge(false);
    }
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();

    const completedBy = playerName.trim();
    if (!completedBy) {
      setNameError("Enter a name to save your score.");
      return;
    }

    if (completedBy.length > 12) {
      setNameError("Use 12 characters or fewer.");
      return;
    }

    setNameError("");
    await handleWin(elapsedSeconds, completedBy);
    navigate("/passport");
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

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full shadow-lg text-right">
            <span className="block font-sans font-bold text-lg leading-none tracking-wider text-[#E4CBAF] tabular-nums">
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl text-center mb-8 leading-tight drop-shadow-md">
        Piece it together!
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

          {showReference && !isSolved && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded bg-[#2D120E]/95 p-5 text-center animate-fade-in">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#E4CBAF]">
                Painting reference
              </p>
              <div className="w-full max-w-[240px] aspect-square rounded-lg border-2 border-[#E4CBAF] bg-[#E8D2B8] p-1 shadow-2xl">
                <img
                  src={imageUrl}
                  alt={`Reference for ${artwork.title?.eng || "this painting"}`}
                  className="w-full h-full rounded object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowReference(false)}
                className="px-5 py-2 rounded-full bg-[#E4CBAF] text-[#3A1414] font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                Back to puzzle
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="relative z-30 flex flex-col items-center mt-5">
        {(showStartPrompt || showHintPrompt) && !showReference && !isSolved && (
          <div className="absolute bottom-full mb-3 w-60 animate-fade-in-up">
            <div className="relative rounded-xl border border-[#6B3A1D] bg-[#E4CBAF] px-4 py-3 text-center text-sm font-sans font-bold text-[#3A1414] shadow-xl">
              {showStartPrompt
                ? "View painting reference here!"
                : "Need a little help?"}
              <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#E4CBAF] border-r border-b border-[#6B3A1D]" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowReference((visible) => !visible);
            setShowHintPrompt(false);
            setShowStartPrompt(false);
          }}
          disabled={isSolved}
          aria-label={showReference ? "Hide painting reference" : "Show painting reference"}
          className={`flex items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#3A1414] shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
            showStartPrompt
              ? "border-[#F2C14E] bg-[#F2C14E] ring-4 ring-[#F2C14E]/40 animate-pulse"
              : "border-[#E4CBAF] bg-[#E4CBAF] hover:brightness-110"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showReference ? (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.242-3.592m3.12-2.07A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.958 9.958 0 01-3.04 4.664M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </>
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              </>
            )}
          </svg>
        </button>

        {false  && import.meta.env.DEV && !isSolved && (
          <button
            type="button"
            onClick={() => {
              try {
                solvePuzzleForTesting();
              } catch (error) {
                console.error("Test solver could not start:", error.message);
              }
            }}
            className="mt-3 rounded-full border border-[#E4CBAF]/60 bg-black/30 px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-[#E4CBAF] shadow-md transition-all hover:bg-black/50 active:scale-95"
          >
            Solve
          </button>
        )}
      </div>

      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-fade-in z-50 overflow-y-auto">
            
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

            <h2 className="text-3xl font-bold text-gray-200 mb-1 drop-shadow-lg text-center">New High Score!</h2>
            <p className="text-gray-300 text-sm mb-6 uppercase tracking-widest font-sans font-bold">
              {earnedBadgeType} Badge Earned
            </p>
            <p className="text-gray-200 text-sm mb-6 font-sans">
              Completed in {formatElapsedTime(elapsedSeconds)}
            </p>
            <form onSubmit={handleNameSubmit} className="w-full max-w-[250px] font-sans">
              <label
                htmlFor="puzzle-player-name"
                className="block text-gray-200 text-xs font-bold uppercase tracking-widest mb-2"
              >
                Enter your name
              </label>
              <input
                ref={nameInputRef}
                id="puzzle-player-name"
                type="text"
                value={playerName}
                onChange={(event) => {
                  setPlayerName(event.target.value.slice(0, 12));
                  setNameError("");
                }}
                maxLength={12}
                placeholder="YOUR NAME"
                autoComplete="nickname"
                className="w-full px-4 py-3 rounded-lg bg-white text-[#381111] text-center font-bold tracking-widest uppercase placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E19B2D]"
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-300">
                <span>{nameError || "Short name, arcade style"}</span>
                <span>{playerName.length}/12</span>
              </div>
              <button
                type="submit"
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-bold uppercase tracking-wider rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                disabled={isSavingBadge}
              >
                {isSavingBadge ? "Saving..." : "Save Score & Claim Badge"}
              </button>
            </form>
        </div>
      )}

      <h3 className="text-xl text-center mt-8 italic text-[#E4CBAF]/80">
        "{artwork.title?.eng || "Unknown Artwork"}"
      </h3>
    </div>
  );
};

export default Puzzle;
