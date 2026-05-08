import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 

const EndSequence = () => {
  const [step, setStep] = useState('prompt');
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const surveyQuestions = [
    { id: 'q1', text: "How was your experience?" },
    { id: 'q2', text: "How easy was it to navigate?" },
    { id: 'q3', text: "How responsive was the system?" },
    { id: 'q4', text: "Did the system immerse you as a user?" }
  ];

  const handleRating = (questionId, rating) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);

    try {
      const visitorId = localStorage.getItem('artifact_visitor_id');

      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            visitor_id: visitorId, 
            q1_experience: answers.q1,
            q2_navigation: answers.q2,
            q3_responsiveness: answers.q3,
            q4_immersion: answers.q4
          }
        ]);

      if (error) throw error;
      
      setStep('thankyou');
    } catch (error) {
      console.error('Error submitting survey:', error.message);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#857A74] overflow-hidden flex flex-col items-center justify-center font-serif relative box-border pb-[120px]">
      
      {(step === 'survey' || step === 'thankyou') && (
        <div className="absolute top-12 w-full animate-fade-in">
        </div>
      )}

      {step === 'prompt' && (
        <div className="w-11/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up">
          <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <h3 className="text-[#4A260F] text-[1.3rem] leading-snug mb-8 max-w-[250px]">
              Would you like to consider a survey?
            </h3>
            
            <div className="flex w-full gap-4 px-2">
              <button 
                onClick={() => setStep('survey')}
                className="flex-1 bg-transparent border-[1.5px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
              >
                Yes
              </button>
              <button 
                onClick={() => setStep('thankyou')}
                className="flex-1 bg-transparent border-[1.5px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'survey' && (
        <div className="w-11/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up max-h-[70vh] flex flex-col mt-8">
          <div className="bg-[#E0CCB6] rounded-xl px-5 py-6 flex flex-col overflow-y-auto hide-scrollbar border border-[#C4AB8F]">
            
            {surveyQuestions.map((q, index) => (
              <div key={q.id} className="mb-6 last:mb-4">
                <p className="text-[#4A260F] text-[1.15rem] mb-3 leading-tight tracking-wide">
                  {index + 1}. {q.text}
                </p>
                <div className="flex justify-between w-full px-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleRating(q.id, num)}
                      className={`w-[45px] h-[45px] rounded-xl border-[1.5px] text-[1.1rem] transition-all shadow-sm ${
                        answers[q.id] === num 
                          ? 'bg-[#4A260F] border-[#4A260F] text-[#E0CCB6] scale-105' 
                          : 'bg-transparent border-[#4A260F] text-[#4A260F] hover:bg-[#4A260F]/10'
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
              className={`mt-4 w-full py-3 rounded-xl text-lg transition-all ${
                Object.keys(answers).length < surveyQuestions.length || isSubmitting
                  ? 'bg-[#BBA58F] border border-[#A28464] text-[#70563C] cursor-not-allowed'
                  : 'bg-[#381111] text-[#E0CCB6] shadow-md hover:brightness-110'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {step === 'thankyou' && (
        <div className="w-11/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8">
          <div className="bg-[#E0CCB6] rounded-xl py-12 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <h3 className="text-[#4A260F] text-[2rem] leading-tight tracking-wide">
              Thank you<br/>for participating!
            </h3>
            
            <button 
              onClick={() => {
                setStep('prompt');
                setAnswers({}); 
              }}
              className="absolute bottom-4 text-xs text-[#4A260F]/30 underline font-sans"
            >
              Reset Sequence
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EndSequence;