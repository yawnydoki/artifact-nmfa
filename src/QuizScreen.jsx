import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Make sure this path is correct!

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Grab the active painting's data passed from the Dashboard
  const artwork = location.state?.artwork;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'passed', 'failed'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Kick the user back to the dashboard if they refresh the page and lose the artwork data
  useEffect(() => {
    if (!artwork) navigate('/');
  }, [artwork, navigate]);

  if (!artwork) return null; // Prevents crash while redirecting

  // 2. Bundle the 5 JSON columns into a clean array we can loop through
  const questions = [artwork.q1, artwork.q2, artwork.q3, artwork.q4, artwork.q5];
  const currentQuestionData = questions[currentQIndex];

  // 3. Extract the current language data (Defaulting to English)
  const currentLang = 'eng'; 
  const questionText = currentQuestionData[currentLang].question;
  const choices = currentQuestionData[currentLang].choices;
  const correctIndex = currentQuestionData.correct_index;

  // 4. Handle their answer selection
  const handleAnswer = async (index) => {
    // Prevent clicking multiple buttons
    if (selectedAnswer !== null) return; 
    
    setSelectedAnswer(index);
    const isCorrect = index === correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    // Pause for 1 second so they can see if they got it right/wrong, then move on
    setTimeout(async () => {
      setSelectedAnswer(null);

      if (currentQIndex === 4) {
        // End of quiz! Let's say 3 out of 5 is a passing grade
        if (newScore >= 3) {
          setGameState('passed');
          await awardBadge();
        } else {
          setGameState('failed');
        }
      } else {
        // Move to the next question
        setCurrentQIndex(prev => prev + 1);
      }
    }, 1200);
  };

  // 5. The Database saving function
  const awardBadge = async () => {
    setIsSaving(true);
    const visitorId = localStorage.getItem('artifact_visitor_id');
    
    if (visitorId) {
      try {
        await supabase.from('unlocked_badges').insert([
          { 
            visitor_id: visitorId, 
            artwork_id: artwork.id, 
            badge_type: 'Gold' 
          }
        ]);
        console.log("Badge saved to database!");
      } catch (error) {
        console.error("Error saving badge:", error.message);
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="h-screen w-screen bg-[#16120c] overflow-hidden flex flex-col items-center justify-center font-hind relative">
      
      {/* HEADER */}
      <div className="absolute top-12 text-center w-full px-4">
        <h2 className="font-daruma text-[#EBDAB5] text-2xl tracking-widest">{artwork.title[currentLang]}</h2>
        <p className="text-[#E6BA39] text-sm">Badge Challenge</p>
      </div>

      {/* --- PLAYING STATE --- */}
      {gameState === 'playing' && (
        <div className="w-11/12 max-w-sm bg-[#9C7042] p-2 rounded-[32px] shadow-2xl animate-fade-in-up">
          <div className="bg-[#EBDAB5] rounded-2xl p-6 flex flex-col items-center text-center min-h-[350px]">
            
            <div className="w-full flex justify-between text-[#4A2E1B] text-xs font-bold mb-4">
              <span>Q {currentQIndex + 1} / 5</span>
              <span>Score: {score}</span>
            </div>

            <h3 className="font-daruma text-[#4A2E1B] text-xl leading-snug mb-8 min-h-[60px]">
              {questionText}
            </h3>
            
            <div className="flex flex-col w-full gap-3 mt-auto">
              {choices.map((choice, index) => {
                // Logic to show green for correct, red for wrong after clicking
                let buttonStyle = "bg-white border-2 border-[#C9B99A] text-[#4A2E1B]";
                if (selectedAnswer !== null) {
                  if (index === correctIndex) buttonStyle = "bg-green-500 border-green-600 text-white"; // Highlight correct
                  else if (index === selectedAnswer) buttonStyle = "bg-red-500 border-red-600 text-white"; // Highlight wrong selection
                }

                return (
                  <button 
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`rounded-xl py-3 px-4 font-daruma text-lg transition-all shadow-sm ${buttonStyle}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* --- PASSED STATE --- */}
      {gameState === 'passed' && (
        <div className="w-11/12 max-w-sm bg-[#E6BA39] p-2 rounded-[32px] shadow-2xl animate-fade-in-up text-center">
          <div className="bg-[#16120c] rounded-2xl p-8 flex flex-col items-center border-4 border-[#E6BA39]">
            <h3 className="font-daruma text-white text-3xl mb-2">Quiz Passed!</h3>
            <p className="text-white/80 mb-6">Score: {score} / 5</p>
            
            {/* Mockup of the Gold Badge */}
            <div className="w-24 h-24 bg-gradient-to-br from-[#FFF3A3] to-[#D4AF37] rounded-full mb-6 shadow-[0_0_20px_rgba(230,186,57,0.5)] border-4 border-white flex items-center justify-center">
               <span className="font-daruma text-[#4A2E1B] text-2xl">★</span>
            </div>

            <p className="text-[#E6BA39] text-sm mb-8">
              {isSaving ? "Saving badge to Passport..." : "Gold Badge Unlocked!"}
            </p>

            <button 
              onClick={() => navigate('/passport')}
              className="w-full bg-[#E6BA39] text-[#16120c] py-3 rounded-xl font-daruma text-lg hover:opacity-90"
            >
              View Passport
            </button>
          </div>
        </div>
      )}

      {/* --- FAILED STATE --- */}
      {gameState === 'failed' && (
        <div className="w-11/12 max-w-sm bg-gray-500 p-2 rounded-[32px] shadow-2xl animate-fade-in-up text-center">
          <div className="bg-[#EBDAB5] rounded-2xl p-8 flex flex-col items-center">
            <h3 className="font-daruma text-[#4A2E1B] text-3xl mb-2">Not Quite!</h3>
            <p className="text-[#4A2E1B]/80 mb-8">Score: {score} / 5<br/>You need 3 to pass.</p>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-[#4A2E1B] text-white py-3 rounded-xl font-daruma text-lg hover:opacity-90"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizScreen;