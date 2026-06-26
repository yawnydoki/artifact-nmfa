import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "./LanguageContext";
import PointingGuide from "./PointGuide";
import "./App.css";

const TutorialModal = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { currentLang, setCurrentLang } = useLanguage();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedMode, setExpandedMode] = useState(null);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  const [showGuide, setShowGuide] = useState(false);

  const languages = [
    { code: "eng", label: "English" },
    { code: "tag", label: "Tagalog" },
    { code: "chi", label: "中文 (Chinese)" },
    { code: "jap", label: "日本語 (Japanese)" },
    { code: "kor", label: "한국어 (Korean)" },
  ];

  useEffect(() => {
    if (isSplashActive) {
      const timer = setTimeout(() => {
        setIsSplashActive(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSplashActive]);

  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => {
        setShowSubtext(true);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setShowSubtext(false);
    }
  }, [currentSlide]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isSplashActive) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < 2) {
      setCurrentSlide((prev) => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTap = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest("select") ||
      e.target.closest("a")
    ) {
      return;
    }

    const clickX = e.clientX;
    const screenWidth = window.innerWidth;
    const tapZoneWidth = screenWidth * 0.3;

    if (clickX < tapZoneWidth && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    } else if (clickX > screenWidth - tapZoneWidth && currentSlide < 2) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const LogoIcon = ({ customClass = "mb-4 w-20 h-20" }) => (
    <img
      src="/logo_trans.png"
      alt="ArtiFact Logo"
      className={`${customClass} drop-shadow-md object-contain`}
    />
  );

  if (isSplashActive) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#430d0d] text-white flex flex-col items-center justify-center font-serif h-[100dvh] overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pb-10">
          <LogoIcon customClass="w-28 h-28 sm:w-20 sm:h-20" />
          <p className="font-serif font-bold text-7xl sm:text-8xl tracking-tight mb-1 leading-none">
            {t("welcome")}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-script text-8xl sm:text-8xl -rotate-6 italic">
              {t("to")}
            </span>
            <p className="font-serif font-bold text-5xl sm:text-2xl tracking-wide">
              {t("ArtiFact!")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showGuide) {
    return <PointingGuide onComplete={onClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-[#430d0d] text-[#F5EAD4] flex flex-col items-center justify-between font-serif h-[100dvh] overflow-hidden animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      <div className="w-full flex justify-end p-5 z-10 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-white text-3xl font-bold hover:scale-110 active:scale-95 transition-transform pointer-events-auto"
        >
          X
        </button>
      </div>

      <div className="text-white flex-1 w-full max-w-sm px-6 flex flex-col items-center overflow-y-auto hide-scrollbar pb-24 relative">
        {currentSlide === 0 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center w-full overflow-hidden">
            <div
              className={`flex flex-col items-center transition-all duration-1000 ease-in-out transform ${
                showSubtext ? "translate-y-0 mb-4" : "sm:translate-y-[15dvh]"
              }`}
            >
              <LogoIcon customClass="w-28 h-28 sm:w-20 sm:h-20" />
              <p className="font-serif font-bold text-7xl sm:text-8xl tracking-tight mb-1 leading-none">
                {t("welcome")}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-script text-8xl sm:text-8xl -rotate-6 italic">
                  {t("to")}
                </span>
                <p className="font-serif font-bold text-5xl sm:text-2xl tracking-wide">
                  {t("ArtiFact!")}
                </p>
              </div>
            </div>

            <div
              className={`w-full select-none pointer-events-none transition-all duration-1000 ease-in-out transform ${
                showSubtext
                  ? "opacity-100 translate-y-0 max-h-[500px]"
                  : "opacity-0 translate-y-10 max-h-0 overflow-hidden"
              }`}
            >
              <p className="font-serif text-[15px] sm:text-base mb-4 leading-relaxed px-2 text-center">
                {t("ArtiFact is an undergraduate thesis project in Beta.")}
              </p>
              <p className="font-serif text-[15px] sm:text-base mb-6 leading-relaxed px-2 text-center">
                {t(
                  "Thank you for exploring and testing our system. We hope you enjoy experiencing art in a more interactive way.",
                )}
              </p>
              <div className="font-serif text-right w-full pr-4 text-base sm:text-lg italic">
                <p>
                  {t("Sincerely,")}
                  <br />
                  {t("The Researchers")}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentSlide === 1 && (
          <div className="flex flex-col w-full h-full animate-fade-in">
            <div className="flex flex-col items-center mb-4 flex-shrink-0 text-center">
              <LogoIcon customClass="mb-2 w-16 h-16" />
              <p className="font-serif text-4xl sm:text-4xl mb-1">
                {t("How to Use")}
              </p>
              <p className="font-serif text-5xl sm:text-6xl tracking-wide">
                {t("ArtiFact:")}
              </p>
            </div>

            <div className="flex-1 w-full flex flex-col gap-3 overflow-y-auto hide-scrollbar">
              <div className="w-full flex flex-col">
                <p className="text-sm text-[#F5EAD4] sm:text-base font-sans pb-2 pl-1 text-left">
                  {t("Scan Paintings and Learn!")}
                </p>
                <button
                  onClick={() =>
                    setExpandedMode(expandedMode === "info" ? null : "info")
                  }
                  className={`w-full bg-[#F5EAD4] text-[#4A1515] py-2.5 px-2 rounded-lg flex justify-between items-center text-base sm:text-lg shadow-md transition-all active:scale-100 ${expandedMode === "info" ? "rounded-b-none" : ""}`}
                >
                  {t("Informational Mode")}
                  <svg
                    className={`w-8 h-8 transition-transform duration-300 ${expandedMode === "info" ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  className={`w-full bg-[#F5EAD4] rounded-b-lg flex flex-col gap-2 p-2 shadow-md overflow-hidden transition-all duration-300 ${expandedMode === "info" ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 p-0 m-0 border-none"}`}
                >
                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Use the MAP ICON")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t("To find hints on where to locate paintings.")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center justify-between gap-2 shadow-lg">
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("SCAN Paintings")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t("Unlock badges and read more about each artwork.")}
                      </span>
                    </div>
                    <div className="bg-[#EBC37A] text-[#4A1515] px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-[#A68340] shadow-sm flex-shrink-0">
                      {t("SCAN")}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15,6H9A1,1,0,0,0,8,7v4a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V7A1,1,0,0,0,15,6Zm-1,4H10V8h4Zm3-8H5A1,1,0,0,0,4,3V21a1,1,0,0,0,1,1H17a3,3,0,0,0,3-3V5A3,3,0,0,0,17,2Zm1,17a1,1,0,0,1-1,1H6V4H17a1,1,0,0,1,1,1Z"
                        fill="currentColor"
                      />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Check your PASSPORT")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t(
                          "View your badge progress and scan the history of previously discovered paintings.",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Earn your digital certificate")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t(
                          "Unlock all paintings to receive a certificate showing your collected badges.",
                        )}
                      </span>
                    </div>
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-[#7A2323] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col mt-1">
                <p className="text-sm sm:text-base text-[#F5EAD4] font-sans pb-2 pl-1 text-left">
                  {t("Challenge Yourself and Earn Rewards!")}
                </p>
                <button
                  onClick={() =>
                    setExpandedMode(expandedMode === "game" ? null : "game")
                  }
                  className={`w-full bg-[#F5EAD4] text-[#4A1515] py-2.5 px-4 rounded-lg flex justify-between items-center text-base sm:text-lg shadow-md transition-all active:scale-100 ${expandedMode === "game" ? "rounded-b-none" : ""}`}
                >
                  {t("Gamified Mode")}
                  <svg
                    className={`w-8 h-8 transition-transform duration-300 ${expandedMode === "game" ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  className={`w-full bg-[#F5EAD4] rounded-b-lg flex flex-col gap-2 p-2 shadow-md overflow-hidden transition-all duration-300 ${expandedMode === "game" ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 p-0 m-0 border-none"}`}
                >
                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Use the MAP ICON")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t("To find hints on where to locate paintings.")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center justify-between gap-2 shadow-lg">
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("SCAN Paintings")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t("Unlock badges and read more about each artwork.")}
                      </span>
                    </div>
                    <div className="bg-[#EBC37A] text-[#4A1515] px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-[#A68340] shadow-sm flex-shrink-0">
                      {t("SCAN")}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="4" />
                      <line x1="6" y1="12" x2="10" y2="12" />
                      <line x1="8" y1="10" x2="8" y2="14" />
                      <line x1="15" y1="13" x2="15.01" y2="13" />
                      <line x1="18" y1="11" x2="18.01" y2="11" />
                    </svg>
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("CHALLENGE yourself")}
                      </span>
                      <span className="text-[#4A1515] text-[9.5px] sm:text-[10px] leading-tight font-sans mt-0.5">
                        {t(
                          "You have 3 lives. Score 3 correct answers, you get gold badge; otherwise, you get a silver badge.",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Check your PASSPORT")}
                      </span>
                      <span className="text-[#4A1515] text-[10px] sm:text-[11px] leading-tight font-sans mt-0.5">
                        {t(
                          "View your badge progress and scan the history of previously discovered paintings.",
                        )}
                      </span>
                    </div>
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15,6H9A1,1,0,0,0,8,7v4a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V7A1,1,0,0,0,15,6Zm-1,4H10V8h4Zm3-8H5A1,1,0,0,0,4,3V21a1,1,0,0,0,1,1H17a3,3,0,0,0,3-3V5A3,3,0,0,0,17,2Zm1,17a1,1,0,0,1-1,1H6V4H17a1,1,0,0,1,1,1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <div className="bg-white border-2 border-[#5C1B1B] rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-[#7A2323] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[#7A2323] text-[14px] sm:text-[15px] font-bold leading-tight">
                        {t("Earn REWARDS")}
                      </span>
                      <span className="text-[#4A1515] text-[9.5px] sm:text-[10px] leading-tight font-sans mt-0.5">
                        {t(
                          "Unlock all paintings to earn a digital certificate, or collect all 10 Gold Badges to receive a pin award.",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm sm:text-base leading-tight mt-3 flex-shrink-0 text-center">
              {t("Explore Art Your Way — Learn Freely")}
              <br />
              {t("or Play the Challenge.")}
            </p>
          </div>
        )}

        {currentSlide === 2 && (
          <div className="flex flex-col h-full animate-fade-in text-center relative">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 mt-4">
              <LogoIcon customClass="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
              <h2 className="font-serif font-bold text-3xl sm:text-4xl tracking-wide">
                {t("Short Disclaimer")}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar font-sans text-[16px] sm:text-[18px] leading-relaxed opacity-95 text-left">
              <p className="font-serif text-justify mb-4">
                {t(
                  "ArtiFact currently only includes 10 selected paintings as the system is presently intended for research and educational project purposes. Due to the limited number of artworks, users in Informational Mode will temporarily share certain features from the Gamified Educational Mode, such as using the Map icon to help locate paintings more easily.",
                )}
              </p>
              <p className="font-serif text-justify mb-4">
                {t(
                  'Users may also revisit the tutorial anytime through the Passport and History section by selecting the "How to Play" bar for guidance and navigation instructions. If you would like to support this project or have any concerns, you may contact us at:',
                )}{" "}
                <br />
                <a
                  href="mailto:fantasticfore.feua@gmail.com"
                  className="underline underline-offset-4 decoration-white/50 text-center block mt-2 pointer-events-auto relative z-50"
                >
                  fantasticfore.feua@gmail.com
                </a>
              </p>
            </div>
            <div className="flex flex-col items-center mt-4 flex-shrink-0">
              <p className="text-base sm:text-lg font-serif mb-3">
                {t("Click the Camera to Start Exploring!")}
              </p>

              <button
                onClick={() => setShowGuide(true)}
                className="bg-[#F5EAD4] text-[#4A1515] px-6 py-4 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all pointer-events-auto relative z-50 flex flex-col items-center gap-1"
              >
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(0, 0)"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsLangOpen(true)}
        className="absolute bottom-6 left-6 z-[250] pointer-events-auto p-3 rounded-full transition-all duration-300 text-white hover:bg-white/10 active:scale-95"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      </button>

      {isLangOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] animate-fade-in pointer-events-auto"
          onClick={() => setIsLangOpen(false)}
        ></div>
      )}

      <div
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl z-[300] transition-all duration-300 border border-museum-gold/30 pointer-events-auto ${
          isLangOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-[120%] opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-museum-gold text-2xl tracking-wide">
            {t("Select Language")}
          </h3>
          <button
            onClick={() => setIsLangOpen(false)}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                if (setCurrentLang) setCurrentLang(lang.code);
                setTimeout(() => setIsLangOpen(false), 200);
              }}
              className={`py-3.5 px-5 rounded-xl font-neohellenic text-lg text-left transition-all tracking-wide border ${
                (currentLang || i18n.language) === lang.code
                  ? "bg-museum-gold/10 border-museum-gold text-museum-gold shadow-md pl-6"
                  : "bg-white/5 border-transparent text-white hover:bg-white/10"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 w-full flex justify-center gap-1 z-10 bg-gradient-to-t from-[#430d0d] pt-6 pb-2 pointer-events-none">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-10 bg-white" : "w-10 bg-gray-400/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TutorialModal;