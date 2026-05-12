import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useLanguage } from './LanguageContext'; 
import { uiDict } from './translations';         

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const artwork = location.state?.artwork;

  const { currentLang } = useLanguage();
  const t = uiDict[currentLang] || uiDict.eng;
  const isCJK = ['chi', 'jap', 'kor'].includes(currentLang);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('playing'); 
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (!artwork) navigate('/');
  }, [artwork, navigate]);

  if (!artwork) return null;

  const questions = [artwork.q1, artwork.q2, artwork.q3, artwork.q4, artwork.q5];
  const currentQuestionData = questions[currentQIndex];
  
  const questionText = currentQuestionData?.[currentLang]?.question || currentQuestionData?.eng?.question;
  const choices = currentQuestionData?.[currentLang]?.choices || currentQuestionData?.eng?.choices || [];
  const correctIndex = currentQuestionData?.correct_index;

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
    <div className="h-[100dvh] w-screen bg-artifact-bg overflow-hidden flex flex-col items-center justify-center font-neohellenic relative pt-10 pb-[100px] box-border">
      
      {(gameState === 'playing' || gameState === 'failed') && (
        <div className="absolute top-12 w-full px-6 flex justify-between items-center z-10">
          <h2 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-white text-[1.4rem] tracking-wide drop-shadow-sm`}>
            {t.testYourself || "Test yourself!"}
          </h2>
          <div className="bg-[#1B4B18] text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#2D8029] tracking-wider shadow-sm">
            ♡ {lives}/3 {t.lives || "LIVES"}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-11/12 max-w-sm bg-[#381111] rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8 overflow-hidden flex flex-col border border-white/5">
          <div className="pt-6 px-6 flex flex-col items-center text-center">
            <div className="flex gap-[5px] mb-2 justify-center">
               {[0, 1, 2, 3, 4].map(step => (
                 <div 
                   key={step} 
                   className={`h-1.5 w-1.5 rounded-full ${step === currentQIndex ? 'bg-[#FDFBF7]' : step < currentQIndex ? 'bg-[#FDFBF7]/50' : 'bg-[#783713]'}`}
                 ></div>
               ))}
            </div>

            <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-[#dfc4a7] text-[1.35rem] leading-snug min-h-[60px] flex items-center justify-center`}>
              {questionText}
            </h3>
          </div>

          <div className="mb-8 bg-[#dfc4a7] px-6 py-6 flex flex-col gap-4">
            {choices.map((choice, index) => {
              let buttonStyle = "bg-[#dfc4a7] border-2 border-[#4A260F] text-[#453128] shadow-[0_4px_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-[4px]";
              
              if (selectedAnswer !== null) {
                if (index === correctIndex) {
                  buttonStyle = "bg-[#4C8C5C] border-2 border-[#1B4B18] text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] translate-y-0";
                } else if (index === selectedAnswer) {
                  buttonStyle = "bg-[#A35252] border-2 border-[#5A2020] text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] shadow-none translate-y-[4px]";
                } else {
                  buttonStyle = "bg-[#dfc4a7]/50 border-2 border-[#453128]/50 text-[#453128]/50 shadow-[0_4px_0_rgba(0,0,0,0.25)] shadow-none translate-y-[4px]";
                }
              }

              return (
                <button 
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`rounded-xl py-2 ${isCJK ? 'font-sans text-sm' : 'font-serif text-[1.1rem]'} transition-all ${buttonStyle}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'passed' && (
        <div className="w-full flex flex-col items-center animate-fade-in-up">
          <div className="w-10/12 max-w-[300px] bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl relative border border-white/5">
            
            <div className="bg-[#E0CCB6] rounded-xl pt-6 pb-8 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
              
              <h3 className={`${isCJK ? 'font-sans' : 'font-serif'} text-[#4A260F] text-2xl`}>
                {t.badgeUnlocked || "Badge Unlocked!"}
              </h3>
              
              <div className="w-full h-[4px] bg-[#8b7463]/40 mb-6"></div>
              
              <div className="w-28 h-28 bg-white rounded-full mb-4 border-[6px] border-[#E6BA39] shadow-md overflow-hidden flex items-center justify-center">
                {artwork.badge_url ? (
                  <img src={artwork.badge_url} alt="Unlocked Badge" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E6BA39] text-3xl font-serif">★</span>
                )}
              </div>
              
              <p className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-[#783713] text-xl leading-tight`}>
                {artwork.badge_name?.[currentLang] || artwork.badge_name?.eng || `${artwork.title?.eng} Badge`}
              </p>
            </div>

          </div>

          <button 
            onClick={() => navigate('/passport')}
            className={`mt-8 px-8 py-3 rounded-full border border-white/40 text-white shadow-md hover:bg-white/10 transition-colors ${isCJK ? 'font-sans font-bold' : 'font-serif text-lg'}`}
          >
            {t.viewPassport || "View in Passport"}
          </button>
        </div>
      )}

      {gameState === 'failed' && (
        <div className="w-10/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8">
           <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            
            <h3 className={`${isCJK ? 'font-sans font-bold' : 'font-serif'} text-[#4A260F] text-3xl mb-3 leading-tight`}>
              {t.outOfLives || "Out of Lives!"}
            </h3>
            
            <p className={`${isCJK ? 'font-sans' : 'font-neohellenic'} text-[#4A260F]/80 mb-8`}>
              {t.reviewAndTry || "Review the clues and try again."}
            </p>
            
            <button 
              onClick={() => navigate('/')}
              className={`w-full bg-[#4A260F] text-[#E0CCB6] py-3 rounded-xl ${isCJK ? 'font-sans font-bold' : 'font-serif text-[1.1rem]'} shadow-md hover:brightness-110 transition-all`}
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