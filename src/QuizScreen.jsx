import React, { useState } from "react";
import { supabase } from './supabaseClient';

const QuizScreen = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      question: "Who is the Artist of Spoliarium?",
      options: [
        "Fernando Amorsolo",
        "Juan Luna",
        "Francisco Balagtas",
        "Jose Rizal",
      ],
      answer: "Juan Luna",
    },
    {
      question: "Spoliarium year of creation?",
      options: ["1884", "1899", "1972", "1989"],
      answer: "1884",
    },
    {
      question: "What does the painting depict?",
      options: [
        "A peaceful landscape",
        "A fallen gladiator",
        "A political treaty",
        "A market scene",
      ],
      answer: "A fallen gladiator",
    },
  ];

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);

    const isCorrect = option === questions[currentQuestion].answer;

    setTimeout(() => {
      let newScore = score;
      let newLives = lives;

      if (isCorrect) {
        newScore = score + 1;
        setScore(newScore);
      } else {
        newLives = lives - 1;
        setLives(newLives);
      }

      // Move to next question or end quiz
      if (currentQuestion + 1 < questions.length && newLives > 0) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 600); // 600ms delay so the user sees what they clicked
  };

  const earnedBadge = score === 3 ? "Gold" : "Silver";

  return (
    <div className="h-screen w-screen bg-artifact-blue flex flex-col items-center py-10 font-hind relative overflow-hidden">
      {!showResult ? (
        /* --- QUIZ ACTIVE STATE --- */
        <div className="w-11/12 max-w-sm flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-white font-daruma text-2xl tracking-wider">
              Test yourself!
            </h2>
            <div className="bg-artifact-green/80 border border-white/30 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
              <span>♡</span> {lives}/3 LIVES
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-[#2B435D] p-2 rounded-3xl shadow-2xl relative">
            {/* Inner Beige Card */}
            <div className="bg-artifact-card rounded-2xl pt-4 pb-8 px-5 flex flex-col items-center">
              {/* Progress Bars */}
              <div className="flex gap-2 w-1/2 mb-6">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full ${idx <= currentQuestion ? "bg-[#5B6F3A]" : "bg-[#C9B99A]"}`}
                  ></div>
                ))}
              </div>

              {/* Question Text */}
              <h3 className="font-daruma text-artifact-border text-xl text-center mb-8 leading-snug">
                {questions[currentQuestion].question}
              </h3>

              {/* Options */}
              <div className="w-full flex flex-col gap-3">
                {questions[currentQuestion].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect =
                    option === questions[currentQuestion].answer;

                  // Visual feedback logic for when an answer is clicked
                  let buttonClass =
                    "bg-[#EAE0C8] border-[#C9B99A] text-artifact-border"; // Default
                  if (selectedAnswer) {
                    if (isSelected && isCorrect)
                      buttonClass =
                        "bg-green-200 border-green-500 text-green-900";
                    if (isSelected && !isCorrect)
                      buttonClass = "bg-red-200 border-red-500 text-red-900";
                    if (!isSelected && isCorrect)
                      buttonClass =
                        "bg-green-100 border-green-400 text-green-800"; // Reveal correct
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(option)}
                      className={`w-full py-3.5 px-4 rounded-2xl border-b-4 font-daruma text-lg tracking-wide transition-all active:translate-y-1 active:border-b-0 ${buttonClass}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-11/12 max-w-sm flex flex-col items-center justify-center h-full pb-20 animate-fade-in-up">
          <h1 className="text-white font-daruma text-4xl tracking-wider mb-10 drop-shadow-md">
            Congratulations!
          </h1>

          <div className="bg-[#2B435D] p-3 rounded-3xl relative shadow-2xl w-full max-w-[280px]">
            {/* Close 'X' Button */}
            <button
              onClick={() => window.location.reload()} // Quick reset for prototype
              className="absolute -top-3 -right-3 bg-[#C9B99A] border-2 border-artifact-border text-artifact-border rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 hover:bg-white"
            >
              ✕
            </button>

            <div className="bg-artifact-card rounded-2xl p-6 flex flex-col items-center text-center">
              <h3 className="font-daruma text-artifact-border text-xl border-b-2 border-artifact-border/20 pb-2 w-full mb-6">
                Badge Unlocked!
              </h3>

              {/* Badge UI */}
              <div
                className={`w-28 h-28 rounded-full border-8 shadow-inner mb-4 bg-white flex items-center justify-center
                ${earnedBadge === "Gold" ? "border-artifact-gold" : "border-gray-400"}`}
              >
                {/* Normally the painting thumbnail goes here */}
              </div>

              <p className="font-daruma text-artifact-border text-lg mt-2">
                The Fallen Galea
              </p>
              <p className="text-artifact-border/70 font-bold text-xs mt-1 uppercase tracking-widest">
                {earnedBadge} Badge Earned
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleAnswer = async (index) => {
    setSelectedAnswer(index);
    
    if (index === currentQuiz.correct) {
      setGameState('passed');
      
      // Save the gold badge to the database!
      const visitorId = localStorage.getItem('artifact_visitor_id');
      if (visitorId) {
        await supabase.from('unlocked_badges').insert([
          { 
            visitor_id: visitorId, 
            artwork_id: 1, // Assuming Spoliarium is ID 1
            badge_type: 'Gold' 
          }
        ]);
      }
    } else {
      setGameState('failed');
    }
  };
};

export default QuizScreen;
