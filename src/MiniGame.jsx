import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MiniGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const artwork = location.state?.artwork;

  const hasQuiz = artwork?.q1?.eng?.question?.trim().length > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#2D120E]">
      <div className="relative w-[320px] bg-[#5B1616] rounded-2xl p-3 shadow-2xl">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-6 text-3xl text-black hover:scale-110 transition-transform"
        >
          ×
        </button>

        <div className="bg-[#E4CBAF] rounded-xl p-4 flex flex-col gap-4">
          <h1 className="text-center text-4xl font-serif text-[#3A1414] mb-2 mt-2">
            Mini-Game
          </h1>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate("/puzzle", { state: { artwork } })}
              className="w-full h-14 rounded-xl border-2 border-[#6B3A1D] bg-[#E8D2B8] text-[#4B2414] text-2xl font-serif shadow-md hover:bg-[#edd9c3] transition-colors"
            >
              Try Puzzle!
            </button>
            <p className="text-center text-[#5C3726] text-xs font-serif">
              Complete the puzzle to earn your next badge.
            </p>
          </div>

          {hasQuiz && (
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => navigate("/quiz", { state: { artwork } })}
                className="w-full h-14 rounded-xl border-2 border-[#6B3A1D] bg-[#E8D2B8] text-[#4B2414] text-2xl font-serif shadow-md hover:bg-[#edd9c3] transition-colors"
              >
                Try Quiz!
              </button>
              <p className="text-center text-[#5C3726] text-xs font-serif">
                Get 3 correct and earn a Gold Badge!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniGame;