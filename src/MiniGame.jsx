import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MiniGame = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const artwork = location.state?.artwork;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#2D120E]">
      <div className="relative w-[320px] bg-[#5B1616] rounded-2xl p-3">

        <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-6 text-3xl text-black"
          >
            ×
        </button>

        <div className="bg-[#E4CBAF] rounded-xl p-2">

          <h1 className="text-center text-4xl font-serif text-[#3A1414] mb-5">
            Mini-Game
          </h1>

          <button
            onClick={() => navigate("/")}
            className="w-full h-14 rounded-xl border-2 border-[#6B3A1D] bg-[#E8D2B8] text-[#4B2414] text-2xl font-serif shadow-md hover:bg-[#edd9c3] transition"
          >
            Try Puzzle!
          </button>

          <p className="text-center text-[#5C3726] text-xs font-serif mt-2 mb-4">
            Complete the puzzle and earn a silver badge.
          </p>

          <button
            onClick={() =>
                navigate("/quiz", {
                    state: { artwork }
                })
            }
            className="w-full h-14 rounded-xl border-2 border-[#6B3A1D] bg-[#E8D2B8] text-[#4B2414] text-2xl font-serif shadow-md hover:bg-[#edd9c3] transition"
          >
            Try Quiz!
          </button>

          <p className="text-center text-[#5C3726] text-xs font-serif  mt-2 mb-2">
            Get 3 correct and earn a Gold Badge!
          </p>

        </div>
      </div>
    </div>
  );
};

export default MiniGame;