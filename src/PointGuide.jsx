import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const PointingGuide = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const steps = [
    {
      id: "camera",
      targetId: "tour-camera",
      title: t("Scan Artworks!"),
      description: t("Point your camera at any painting to uncover its secrets."),
    },
    {
      id: "map",
      targetId: "tour-map",
      title: t("Find Hints"),
      description: t("Check the map to see where hidden paintings are located."),
    },
    {
      id: "passport",
      targetId: "tour-passport",
      title: t("View Rewards"),
      description: t("Track your badges and certificates in your Passport."),
    },
    {
      id: "end",
      targetId: "tour-end-prompt",
      title: t("Claim Certificate"),
      description: t("Get your digital certificate here when you're done!"),
    }
  ];

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      const el = document.getElementById(steps[currentStep].targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };
    
    updateRect();
    const timeout = setTimeout(updateRect, 150); 
    return () => clearTimeout(timeout);
  }, [currentStep, windowSize]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const stepData = steps[currentStep];

  let pointerStyle = { opacity: 0 };
  let tooltipStyle = { opacity: 0 };
  let ringStyle = { opacity: 0 };

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetTop = targetRect.top;

    ringStyle = {
      top: targetRect.top + targetRect.height / 2 - 24, 
      left: targetRect.left + targetRect.width / 2 - 24,
      width: 48,
      height: 48,
      opacity: 1,
    };

    pointerStyle = {
      top: targetTop - 70, 
      left: targetCenterX - 28,
      opacity: 1,
    };

    let tooltipLeft = targetCenterX - 130; 
    tooltipLeft = Math.max(16, Math.min(windowSize.width - 276, tooltipLeft)); 

    tooltipStyle = {
      top: targetTop - 220,
      left: tooltipLeft,
      opacity: 1,
    };
  }

  return (
    <div className="fixed inset-0 z-[400] pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={handleNext}
      />

      <AnimatePresence mode="wait">
        <div key={stepData.id} className="absolute inset-0 pointer-events-none">
          
          {targetRect && (
            <motion.div 
              className="absolute rounded-full border-4 border-[#EBC37A]"
              style={ringStyle}
              animate={{ scale: [1, 1.8], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
          )}

          <motion.div 
            className="absolute w-[260px] bg-[#E0CCB6] p-4 rounded-2xl shadow-2xl border-2 border-[#5C1B1B] pointer-events-auto"
            style={tooltipStyle}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <h3 className="font-serif text-[#7A2323] text-xl font-bold mb-1 leading-tight">
              {stepData.title}
            </h3>
            <p className="font-sans text-[#4A1515] text-[13px] leading-relaxed mb-4">
              {stepData.description}
            </p>
            
            <div className="flex justify-between items-center w-full">
              <span className="text-[#4A1515]/60 text-xs font-bold">
                {currentStep + 1} / {steps.length}
              </span>
              <button 
                onClick={handleNext}
                className="bg-[#7A2323] text-[#F5EAD4] px-4 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-[#5C1B1B] active:scale-95 transition-all"
              >
                {currentStep === steps.length - 1 ? t("Got it!") : t("Next")}
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="absolute text-white"
            style={{ ...pointerStyle, rotate: 180 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <svg className="w-14 h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 3-1.63 4.25-1.12 1.13.46 1.75 1.75 1.75 3.03v2.33c0 3.23-2.3 6.07-5.46 6.47-.36.05-.73.05-1.09.05H11c-2.4 0-4.63-1.29-5.83-3.41l-.94-1.65c-.47-.83-.34-1.88.33-2.56.63-.64 1.66-.75 2.42-.25l2.02 1.34V11.24z"/>
            </svg>
          </motion.div>

        </div>
      </AnimatePresence>
    </div>
  );
};

export default PointingGuide;