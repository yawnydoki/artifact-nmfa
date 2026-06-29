import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EndPrompt = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isFinished, setIsFinished] = useState(false);

  return (
    <div className="h-[100dvh] w-screen bg-[#4c291d] overflow-hidden flex flex-col items-center justify-center font-serif relative box-border pb-[120px]">
      
      <div className="w-10/11 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up">
        <div className="bg-[#E0CCB6] rounded-xl py-6 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
          
          {!isFinished ? (
            <>
              <h3 className="text-[#4A260F] text-[1.3rem] leading-snug mb-6 max-w-[250px] font-bold">
                {t("Would you like to end the tour?")}
              </h3>
              
              <div className="flex w-full gap-4 px-2">
                <button 
                  onClick={() => setIsFinished(true)}
                  className="flex-1 bg-transparent border-[2px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg font-sans font-bold hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
                >
                  {t("Yes")}
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-transparent border-[2px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg font-sans font-bold hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
                >
                  {t("No")}
                </button>
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-[#4A260F] text-[1.6rem] font-bold leading-snug mb-2">
                {t("Thank You!")}
              </h3>
              
              <p className="text-[#4A260F]/80 text-sm leading-relaxed mb-6">
                {t("Your tour session has ended. You may safely close the app tab now.")}
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default EndPrompt;