import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import { uiDict } from "./translations";
import { useData } from "./DataContext";

const style = document.createElement("style");
style.innerHTML = `
  @keyframes error-shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
  .animate-error-shake { animation: error-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
  @keyframes life-damage { 0% { transform: scale(1); background-color: #1B4B18; border-color: #2D8029; } 20% { transform: scale(1.15); background-color: #A35252; border-color: #ff4d4d; color: #ffcccc; } 40% { transform: translateX(-4px) scale(1.1); } 60% { transform: translateX(4px) scale(1.1); } 80% { transform: translateX(-2px) scale(1.05); } 100% { transform: scale(1); background-color: #1B4B18; border-color: #2D8029; } }
  .animate-life-damage { animation: life-damage 0.5s ease-in-out; }
  @keyframes ink-stamp { 0% { transform: scale(3.5) rotate(calc(var(--stamp-tilt) - 15deg)); opacity: 0; filter: blur(2px); } 50% { transform: scale(0.9) rotate(calc(var(--stamp-tilt) + 2deg)); opacity: 1; filter: blur(0px); } 75% { transform: scale(1.05) rotate(var(--stamp-tilt)); } 100% { transform: scale(1) rotate(var(--stamp-tilt)); } }
  .animate-ink-stamp { animation: ink-stamp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
`;
if (typeof document !== "undefined") document.head.appendChild(style);

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const artwork = location.state?.artwork;

  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;
  const isCJK = ["chi", "jap", "kor"].includes(currentLang);

  const { refreshBadges } = useData();

  const [savedSession] = useState(() => {
    const sessionStr = localStorage.getItem("artifact_quiz_session");
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed.artworkId === artwork?.id) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse quiz session", e);
      }
    }
    return null;
  });

  const [currentQIndex, setCurrentQIndex] = useState(savedSession?.currentQIndex ?? 0);
  const [score, setScore] = useState(savedSession?.score ?? 0);
  const [lives, setLives] = useState(savedSession?.lives ?? 3);
  const [gameState, setGameState] = useState("playing");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [damageAnim, setDamageAnim] = useState(false);
  const [achievedTier, setAchievedTier] = useState("Silver");

  const [toastMessage, setToastMessage] = useState(null);
  const [stampRotation] = useState(() => Math.floor(Math.random() * 16) - 8);

  const [selectedQuestions] = useState(() => {
    if (savedSession?.selectedQuestions) return savedSession.selectedQuestions;
    if (!artwork) return [];
    
    const allQuestions = [
      artwork.q1,
      artwork.q2,
      artwork.q3,
      artwork.q4,
      artwork.q5,
    ].filter(Boolean);
    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 3);
    
    return shuffled.map((q) => {
      const langData = q[currentLang] || q.eng;
      const choices = langData?.choices || [];
      const correctAnswer = choices[q.correct_index];
      const shuffledChoices = [...choices].sort(() => Math.random() - 0.5);
      return {
        ...q,
        _shuffledChoices: shuffledChoices,
        _newCorrectIndex: shuffledChoices.indexOf(correctAnswer),
      };
    });
  });

  useEffect(() => {
    if (artwork && gameState === "playing") {
      const sessionData = {
        artworkId: artwork.id,
        currentQIndex,
        score,
        lives,
        selectedQuestions
      };
      localStorage.setItem("artifact_quiz_session", JSON.stringify(sessionData));
    }
  }, [artwork, currentQIndex, score, lives, selectedQuestions, gameState]);

  useEffect(() => {
    if (!artwork) navigate("/");
  }, [artwork, navigate]);

  if (!artwork) return null;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentQuestionData = selectedQuestions[currentQIndex];
  const questionText =
    currentQuestionData?.[currentLang]?.question ||
    currentQuestionData?.eng?.question;
  const choices = currentQuestionData?._shuffledChoices || [];
  const correctIndex = currentQuestionData?._newCorrectIndex;

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === correctIndex;

    if (isCorrect) {
      setScore(score + 1);
      if (navigator.vibrate) navigator.vibrate([50]);
    } else {
      setLives((prev) => prev - 1);
      setDamageAnim(true);
      setTimeout(() => setDamageAnim(false), 500);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    setTimeout(async () => {
      setSelectedAnswer(null);

      const finalScore = score + (isCorrect ? 1 : 0);

      if (!isCorrect && lives - 1 <= 0) {
        setGameState("failed");
        localStorage.removeItem("artifact_quiz_session");
      } else if (currentQIndex === 2) {
        if (finalScore >= 2) {
          setGameState("passed");
          localStorage.removeItem("artifact_quiz_session");
          if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
          await awardBadge(finalScore);
        } else {
          setGameState("failed");
          localStorage.removeItem("artifact_quiz_session");
        }
      } else {
        setCurrentQIndex((prev) => prev + 1);
      }
    }, 1200);
  };

  const awardBadge = async (finalScore) => {
    const visitorId = localStorage.getItem("artifact_visitor_id");
    if (!visitorId) return;

    const newTier = finalScore === 3 ? "Gold" : "Silver";
    setAchievedTier(newTier);

    const tierValues = { Base: 1, Silver: 2, Gold: 3 };
    
    let currentCache = JSON.parse(localStorage.getItem('artifact_cached_badges') || '[]');
    const existingBadgeIndex = currentCache.findIndex(b => b.artwork_id === artwork.id);
    
    let shouldUpdate = true;
    let existingTier = "Base";

    if (existingBadgeIndex >= 0) {
      existingTier = currentCache[existingBadgeIndex].badge_type || "Base";
      const currentTierValue = tierValues[existingTier] || 1;
      
      if (tierValues[newTier] <= currentTierValue) {
        shouldUpdate = false;
      }
    }

    if (!shouldUpdate) {
      showToast(`Score: ${finalScore}/3`);
      return; 
    }

    const badgeData = {
      visitor_id: visitorId,
      artwork_id: artwork.id,
      badge_type: newTier,
      created_at: new Date().toISOString()
    };

    if (existingBadgeIndex >= 0) {
      currentCache[existingBadgeIndex].badge_type = newTier;
    } else {
      currentCache.push(badgeData);
    }
    localStorage.setItem('artifact_cached_badges', JSON.stringify(currentCache));

    let offlineQueue = JSON.parse(localStorage.getItem('artifact_offline_queue') || '[]');
    offlineQueue = offlineQueue.filter(b => b.artwork_id !== artwork.id);
    offlineQueue.push(badgeData);
    localStorage.setItem('artifact_offline_queue', JSON.stringify(offlineQueue));

    if (existingBadgeIndex >= 0) {
      showToast(`${newTier} Badge Upgraded!`);
    } else {
      showToast(`${newTier} Badge Unlocked!`);
    }

    try {
      const { error } = await supabase
        .from("unlocked_badges")
        .upsert([
          { visitor_id: visitorId, artwork_id: artwork.id, badge_type: newTier }
        ], { onConflict: 'visitor_id, artwork_id' });

      if (error) throw error;

      let updatedQueue = JSON.parse(localStorage.getItem('artifact_offline_queue') || '[]');
      updatedQueue = updatedQueue.filter(b => b.artwork_id !== artwork.id);
      localStorage.setItem('artifact_offline_queue', JSON.stringify(updatedQueue));
      
    } catch (error) {
      console.warn("Offline! Quiz score saved locally. Will sync later.", error.message);
    } finally {
      await refreshBadges();
    }
  };

  const getBorderColor = (tier) => {
    if (tier === "Gold")
      return "border-[#E6BA39] bg-white shadow-[0_0_15px_rgba(230,186,57,0.5)]";
    if (tier === "Silver")
      return "border-[#C0C0C0] bg-[#F3F4F6] shadow-[0_0_10px_rgba(192,192,192,0.4)]";
    return "border-[#CD7F32] bg-[#FFF0E0] shadow-[0_0_8px_rgba(205,127,50,0.5)]";
  };

  return (
    <div className="h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-neohellenic relative pt-10 pb-[100px] box-border">
      {toastMessage && (
        <div className="absolute top-28 left-0 w-full flex justify-center z-[100] animate-fade-in-up pointer-events-none">
          <div className={`text-white px-6 py-3 rounded-full shadow-2xl border-2 font-serif flex items-center gap-3 ${toastMessage.includes("Error") ? "bg-[#A35252] border-[#5A2020]" : "bg-[#4C8C5C] border-[#1B4B18]"}`}>
            <span className="text-2xl drop-shadow-md">{toastMessage.includes("Error") ? "⚠️" : "🏆"}</span>
            <span className="text-lg tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {(gameState === "playing" || gameState === "failed") && (
        <div className="absolute top-12 w-full px-6 flex justify-between items-center z-10">
          <h2
            className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-white text-[1.4rem] tracking-wide drop-shadow-sm`}
          >
            {t.testYourself || "Test yourself!"}
          </h2>
          <div
            className={`text-white text-[10px] font-bold px-3 py-1.5 rounded-full border tracking-wider shadow-sm transition-all duration-200 ${
              damageAnim
                ? "animate-life-damage"
                : "bg-[#1B4B18] border-[#2D8029]"
            }`}
          >
            {damageAnim ? "💔" : "♡"} {lives}/3 {t.lives || "LIVES"}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="w-11/12 max-w-sm bg-[#381111] rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8 overflow-hidden flex flex-col border border-white/5">
            <div className="pt-6 px-6 flex flex-col items-center text-center">
              <div className="flex gap-[5px] mb-2 justify-center">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 w-1.5 rounded-full ${step === currentQIndex ? "bg-[#FDFBF7]" : step < currentQIndex ? "bg-[#FDFBF7]/50" : "bg-[#783713]"}`}
                  ></div>
                ))}
              </div>
              <h3
                className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#dfc4a7] text-[1.35rem] leading-snug text-center min-h-[60px] flex items-center justify-center`}
              >
                {questionText}
              </h3>
            </div>

            <div className="mb-8 bg-[#dfc4a7] px-6 py-6 flex flex-col gap-4">
              {choices.map((choice, index) => {
                let buttonStyle =
                  "bg-[#dfc4a7] border-2 border-[#4A260F] text-[#453128] shadow-[0_4px_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-[4px]";
                let shakeClass = "";

                if (selectedAnswer !== null) {
                  if (index === correctIndex) {
                    buttonStyle =
                      "bg-[#4C8C5C] border-2 border-[#1B4B18] text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] translate-y-0";
                  } else if (index === selectedAnswer) {
                    buttonStyle =
                      "bg-[#A35252] border-2 border-[#5A2020] text-white shadow-none translate-y-[4px]";
                    shakeClass = "animate-error-shake";
                  } else {
                    buttonStyle =
                      "bg-[#dfc4a7]/50 border-2 border-[#453128]/50 text-[#453128]/50 shadow-none translate-y-[4px]";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`rounded-xl py-2 ${isCJK ? "font-sans text-sm" : "font-serif text-[1.1rem]"} transition-all ${buttonStyle} ${shakeClass}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-12 w-full flex justify-center z-20 animate-fade-in-up">
            <button
              onClick={() => navigate("/")}
              className={`px-8 py-2.5 rounded-full bg-[#381111]/90 backdrop-blur-md border border-[#C4AB8F]/50 text-[#E0CCB6] shadow-xl hover:bg-[#4A260F] transition-all active:scale-95 ${isCJK ? "font-sans" : "font-serif"} text-[1.1rem] tracking-wide`}
            >
              {t.exitQuiz || "Exit Quiz"}
            </button>
          </div>
        </>
      )}

      {gameState === "passed" && (
        <div className="w-full flex flex-col items-center animate-fade-in-up">
          <div className="w-10/12 max-w-[300px] bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl relative border border-white/5">
            <div className="bg-[#E0CCB6] rounded-xl pt-6 pb-8 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
              <h3
                className={`${isCJK ? "font-sans" : "font-serif"} text-[#4A260F] text-2xl`}
              >
                {achievedTier === "Gold" ? "Perfect Score!" : "Quiz Passed!"}
              </h3>

              <div className="w-full h-[4px] bg-[#8b7463]/40 mb-6"></div>

              <div
                style={{ "--stamp-tilt": `${stampRotation}deg` }}
                className={`w-28 h-28 rounded-full mb-4 border-[6px] overflow-hidden flex items-center justify-center animate-ink-stamp ${getBorderColor(achievedTier)} ${achievedTier === "Gold" ? "animate-shimmer" : ""}`}
              >
                {artwork.badge_url ? (
                  <img
                    src={artwork.badge_url}
                    alt="Unlocked Badge"
                    className="w-full h-full object-cover saturate-100"
                  />
                ) : (
                  <span
                    className={`${achievedTier === "Gold" ? "text-[#E6BA39]" : "text-[#C0C0C0]"} text-3xl font-serif`}
                  >
                    ★
                  </span>
                )}
              </div>

              <p
                className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#783713] text-xl leading-tight`}
              >
                {achievedTier} {t.badge || "Badge"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/passport")}
            className={`mt-8 px-8 py-3 rounded-full border border-white/40 text-white shadow-md hover:bg-white/10 transition-colors ${isCJK ? "font-sans font-bold" : "font-serif text-lg"}`}
          >
            {t.viewPassport || "View in Passport"}
          </button>
        </div>
      )}

      {gameState === "failed" && (
        <div className="w-10/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8">
          <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <h3
              className={`${isCJK ? "font-sans font-bold" : "font-serif"} text-[#4A260F] text-3xl mb-3 leading-tight`}
            >
              {t.outOfLives || "Out of Lives!"}
            </h3>
            <p
              className={`${isCJK ? "font-sans" : "font-neohellenic"} text-[#4A260F]/80 mb-8`}
            >
              {t.reviewAndTry || "Review the clues and try again."}
            </p>
            <button
              onClick={() => navigate("/")}
              className={`w-full bg-[#4A260F] text-[#E0CCB6] py-3 rounded-xl ${isCJK ? "font-sans font-bold" : "font-serif text-[1.1rem]"} shadow-md hover:brightness-110 transition-all`}
            >
              {t.returnToCamera || "Return to Camera"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;