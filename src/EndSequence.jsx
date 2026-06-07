import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EndSequence = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('prompt');

  const GOOGLE_FORM_URL = "https://forms.gle/QRjdiA5TodgDYxBLA";

  const handleYesClick = () => {
    window.location.href = GOOGLE_FORM_URL;
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#857A74] overflow-hidden flex flex-col items-center justify-center font-serif relative box-border pb-[120px]">
      
      {step === 'thankyou' && (
        <div className="absolute top-12 w-full animate-fade-in">
        </div>
      )}

      {step === 'prompt' && (
        <div className="w-10/11 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up">
          <div className="bg-[#E0CCB6] rounded-xl py-3 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <h3 className="text-[#4A260F] text-[1.3rem] leading-snug mb-4 max-w-[250px]">
              {t("Would you like to consider a survey?")}
            </h3>
            
            <div className="flex w-full gap-4 px-2">
              <button 
                onClick={handleYesClick}
                className="flex-1 bg-transparent border-[2px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
              >
                {t("Yes")}
              </button>
              <button 
                onClick={() => setStep('thankyou')}
                className="flex-1 bg-transparent border-[2px] border-[#4A260F] text-[#4A260F] rounded-xl py-2.5 text-lg hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors shadow-sm"
              >
                {t("No")}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'thankyou' && (
        <div className="w-11/12 max-w-sm bg-[#381111] p-3 rounded-[1.5rem] shadow-2xl animate-fade-in-up mt-8">
          <div className="bg-[#E0CCB6] rounded-xl py-12 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <h3 className="text-[#4A260F] text-[2rem] leading-tight tracking-wide mb-8">
              {t("Thank you")}<br/>{t("for participating!")}
            </h3>
          </div>
        </div>
      )}

    </div>
  );
};

export default EndSequence;