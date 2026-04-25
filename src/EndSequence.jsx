import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // 1. Import your database connection!

const EndSequence = () => {
  const [step, setStep] = useState('prompt');
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // 2. Add a loading state

  const surveyQuestions = [
    { id: 'q1', text: "How was your experience?" },
    { id: 'q2', text: "How easy was it to navigate?" },
    { id: 'q3', text: "How responsive was the system?" },
    { id: 'q4', text: "Did the system immerse you as a user?" }
  ];

  const handleRating = (questionId, rating) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  // 3. The actual Database Insertion Logic
  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);

    try {
      // Send the data to the 'feedback' table
      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            q1_experience: answers.q1,
            q2_navigation: answers.q2,
            q3_responsiveness: answers.q3,
            q4_immersion: answers.q4
          }
        ]);

      if (error) throw error;
      
      // If successful, move to the Thank You screen
      setStep('thankyou');
    } catch (error) {
      console.error('Error submitting survey:', error.message);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#6B5E55] overflow-hidden flex flex-col items-center justify-center font-hind relative">
      
      {step === 'survey' && (
        <div className="absolute top-12 w-11/12 max-w-sm pl-2">
          <h2 className="font-daruma text-white text-2xl tracking-wide drop-shadow-sm">Survey Questionnaire</h2>
        </div>
      )}

      {/* --- STEP 1: INITIAL PROMPT --- */}
      {step === 'prompt' && (
        <div className="w-11/12 max-w-sm bg-[#9C7042] p-2.5 rounded-[32px] shadow-2xl animate-fade-in-up">
          <div className="bg-[#EBDAB5] rounded-2xl p-8 flex flex-col items-center text-center">
            <h3 className="font-daruma text-[#4A2E1B] text-xl leading-snug mb-8">
              Would you like to consider a survey?
            </h3>
            
            <div className="flex w-full gap-4">
              <button 
                onClick={() => setStep('survey')}
                className="flex-1 bg-transparent border-2 border-[#C9B99A] text-[#4A2E1B] rounded-2xl py-3 font-daruma text-lg hover:bg-white transition-colors shadow-sm"
              >
                Yes
              </button>
              <button 
                onClick={() => setStep('thankyou')}
                className="flex-1 bg-transparent border-2 border-[#C9B99A] text-[#4A2E1B] rounded-2xl py-3 font-daruma text-lg hover:bg-white transition-colors shadow-sm"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: THE SURVEY --- */}
      {step === 'survey' && (
        <div className="w-11/12 max-w-sm bg-[#9C7042] p-2.5 rounded-[32px] shadow-2xl animate-fade-in-up mb-20 max-h-[70vh] flex flex-col">
          <div className="bg-[#EBDAB5] rounded-2xl p-6 flex flex-col overflow-y-auto hide-scrollbar">
            
            {surveyQuestions.map((q, index) => (
              <div key={q.id} className="mb-6 last:mb-2">
                <p className="font-daruma text-[#4A2E1B] text-lg mb-3 leading-tight">
                  {index + 1}. {q.text}
                </p>
                <div className="flex justify-between w-full">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleRating(q.id, num)}
                      className={`w-12 h-12 rounded-full border-2 font-daruma text-xl transition-all ${
                        answers[q.id] === num 
                          ? 'bg-[#E6BA39] border-[#E6BA39] text-white scale-110 shadow-md' 
                          : 'bg-[#EAE0C8] border-[#C9B99A] text-[#4A2E1B] hover:bg-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button 
              onClick={handleSubmitSurvey}
              disabled={Object.keys(answers).length < surveyQuestions.length || isSubmitting}
              className={`mt-6 w-full py-3 rounded-2xl font-daruma text-lg transition-all ${
                Object.keys(answers).length < surveyQuestions.length || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#4A2E1B] text-white shadow-md hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: THANK YOU SCREEN --- */}
      {step === 'thankyou' && (
        <div className="w-11/12 max-w-sm bg-[#9C7042] p-2.5 rounded-[32px] shadow-2xl animate-fade-in-up">
          <div className="bg-[#EBDAB5] rounded-2xl py-10 px-6 flex flex-col items-center text-center">
            <h3 className="font-daruma text-[#4A2E1B] text-3xl leading-snug">
              Thank you for<br/>participating!
            </h3>
            
            <button 
              onClick={() => {
                setStep('prompt');
                setAnswers({}); // Clear answers for testing
              }}
              className="mt-8 text-xs text-[#4A2E1B]/50 underline font-arial"
            >
              Reset Sequence (Dev)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EndSequence;