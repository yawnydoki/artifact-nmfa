import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const artwork = location.state?.artwork;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); // Added Lives to match your design!
  const [gameState, setGameState] = useState('playing'); // 'playing', 'passed', 'failed'
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (!artwork) navigate('/');
  }, [artwork, navigate]);

  if (!artwork) return null;

  const questions = [artwork.q1, artwork.q2, artwork.q3, artwork.q4, artwork.q5];
  const currentLang = 'eng'; 
  const currentQuestionData = questions[currentQIndex];
  const questionText = currentQuestionData[currentLang].question;
  const choices = currentQuestionData[currentLang].choices;
  const correctIndex = currentQuestionData.correct_index;

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null) return; 
    
    setSelectedAnswer(index);
    const isCorrect = index === correctIndex;
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setLives(prev => prev - 1);
    }

    setTimeout(async () => {
      setSelectedAnswer(null);

      // Check win/loss conditions
      if (!isCorrect && lives - 1 <= 0) {
        setGameState('failed');
      } else if (currentQIndex === 4) {
        if (score + (isCorrect ? 1 : 0) >= 3) {
          setGameState('passed');
          await awardBadge();
        } else {
          setGameState('failed');
        }
      } else {
        setCurrentQIndex(prev => prev + 1);
      }
    }, 1200);
  };

  const awardBadge = async () => {
    const visitorId = localStorage.getItem('artifact_visitor_id');
    if (visitorId) {
      try {
        await supabase.from('unlocked_badges').insert([
          { visitor_id: visitorId, artwork_id: artwork.id, badge_type: 'Gold' }
        ]);
      } catch (error) {
        console.error("Error saving badge:", error.message);
      }
    }
  };

  return (
    // Matching the Slate Blue background from your Quiz design
    <div className="h-screen w-screen bg-[#577093] overflow-hidden flex flex-col items-center justify-center font-hind relative pt-10">
      
      {/* HEADER (Test yourself & Lives) */}
      {(gameState === 'playing' || gameState === 'failed') && (
        <div className="absolute top-12 w-full px-8 flex justify-between items-center z-10">
          <h2 className="font-daruma text-white text-2xl drop-shadow-sm">Test yourself!</h2>
          <div className="bg-[#4C8C5C] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/30">
            ♡ {lives}/3 LIVES
          </div>
        </div>
      )}

      {/* --- PLAYING STATE --- */}
      {gameState === 'playing' && (
        <div className="w-10/12 max-w-sm bg-[#2A3E60] p-3 rounded-[32px] shadow-2xl animate-fade-in-up mt-8">
          {/* Inner Tan Card */}
          <div className="bg-[#E5DAC1] rounded-2xl p-6 flex flex-col items-center text-center min-h-[400px] border-4 border-[#E5DAC1]">
            
            {/* Progress Bar Mockup */}
            <div className="flex gap-2 mb-6">
               {[0,1,2].map(step => (
                 <div key={step} className={`h-1.5 w-8 rounded-full ${step <= currentQIndex ? 'bg-[#4C8C5C]' : 'bg-[#A69B82]'}`}></div>
               ))}
            </div>

            <h3 className="font-daruma text-[#5C432A] text-xl leading-snug mb-8 min-h-[60px]">
              {questionText}
            </h3>
            
            <div className="flex flex-col w-full gap-4 mt-auto">
              {choices.map((choice, index) => {
                let buttonStyle = "bg-[#E5DAC1] border-2 border-[#BBAF97] text-[#5C432A]";
                if (selectedAnswer !== null) {
                  if (index === correctIndex) buttonStyle = "bg-[#4C8C5C] border-[#4C8C5C] text-white"; 
                  else if (index === selectedAnswer) buttonStyle = "bg-[#A35252] border-[#A35252] text-white"; 
                }

                return (
                  <button 
                    key={index}
                    onClick={() => handleAnswer(index)}
                    // Rounded pills exactly like the design
                    className={`rounded-full py-3 px-4 font-daruma text-[15px] transition-all shadow-sm ${buttonStyle}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- PASSED STATE (Matching the floating card from image_1 & image_3) --- */}
      {gameState === 'passed' && (
        <div className="w-full flex flex-col items-center animate-fade-in-up">
          <h2 className="font-daruma text-white text-4xl mb-8 drop-shadow-md">Congratulations!</h2>
          
          <div className="relative w-9/12 max-w-[280px] bg-[#2A3E60] p-3 rounded-[32px] shadow-2xl">
            {/* Close Button ('X') */}
            <button 
              onClick={() => navigate('/passport')}
              className="absolute -top-3 -right-3 w-10 h-10 bg-[#BBAF97] border-4 border-[#2A3E60] rounded-full flex items-center justify-center font-daruma text-[#5C432A] text-xl z-20 hover:scale-105"
            >
              X
            </button>
            
            <div className="bg-[#E5DAC1] rounded-2xl pt-4 pb-8 px-6 flex flex-col items-center text-center">
              <h3 className="font-daruma text-[#5C432A] text-xl mb-4 border-b-2 border-[#BBAF97] pb-2 w-full">Badge Unlocked!</h3>
              
              {/* Gold Ring Badge with White Center */}
              <div className="w-28 h-28 bg-white rounded-full mb-4 border-[6px] border-[#F2C94C] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"></div>

              <p className="font-daruma text-[#A34232] text-lg tracking-wide">
                Paint Explorer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- FAILED STATE --- */}
      {gameState === 'failed' && (
        <div className="w-10/12 max-w-sm bg-[#2A3E60] p-3 rounded-[32px] shadow-2xl animate-fade-in-up mt-8">
           <div className="bg-[#E5DAC1] rounded-2xl p-8 flex flex-col items-center text-center border-4 border-[#E5DAC1]">
            <h3 className="font-daruma text-[#5C432A] text-3xl mb-2">Out of Lives!</h3>
            <p className="text-[#5C432A]/80 mb-8 font-hind">Review the painting and try again.</p>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-[#5C432A] text-[#E5DAC1] py-3 rounded-full font-daruma text-lg"
            >
              Return to Camera
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizScreen;