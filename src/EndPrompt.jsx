import React from 'react';
import { useNavigate } from 'react-router-dom';

const EndPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] w-screen bg-[#4c291d] overflow-hidden flex flex-col items-center justify-center font-serif relative box-border pb-[120px]">
      
      <div className="w-11/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up">
        <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
          
          <h3 className="text-[#4A260F] text-[1.3rem] leading-snug mb-8 max-w-[250px]">
            Would you like to end the tour?
          </h3>
          
          <div className="flex w-full gap-4 px-2">
            <button 
              onClick={() => navigate('/end')}
              className="flex-1 bg-transparent border-[1.5px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
            >
              Yes
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-transparent border-[1.5px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
            >
              No
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default EndPrompt;