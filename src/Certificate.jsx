import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "./DataContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const style = document.createElement("style");
style.innerHTML = `
  @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 20% { transform: translateX(150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
  .animate-shimmer::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 6.7s infinite; }
`;
if (typeof document !== "undefined") document.head.appendChild(style);

const CorsSafeImage = ({ src, alt, className }) => {
  const [base64Url, setBase64Url] = useState(null);

  useEffect(() => {
    if (!src) return;
    let isMounted = true;
    
    fetch(src)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) {
            setBase64Url(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error("Failed to load image safely:", err);
        if (isMounted) setBase64Url(src); 
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!base64Url) return <div className="w-full h-full bg-[#AA8855]/20 animate-pulse"></div>;

  return <img src={base64Url} alt={alt} className={className} />;
};

const Certificate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unlockedBadges, artworks } = useData();

  const [visitorName, setVisitorName] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const certificateRef = useRef(null);

  const totalBadges = unlockedBadges?.length || 0;

  const earnedBadges = unlockedBadges?.map(ub => {
    const art = artworks?.find(a => a.id === ub.artwork_id);
    return {
      ...ub,
      badge_url: art?.badge_url
    };
  }) || [];

  const handleGenerate = (e) => {
    e.preventDefault();
    if (visitorName.trim() !== "") {
      setIsGenerated(true);
    }
  };

  const nextSlide = () => {
    if (currentSlide < 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleDownload = async (format) => {
    setShowDownloadModal(false); 
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const element = certificateRef.current;
    if (!element) return;

    setIsDownloading(true);
    try {
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: "#3b1212", 
        allowTaint: true,
      });

      const safeName = visitorName.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "visitor";
      const fileName = `Artifact_Certificate_${safeName}`;

      if (format === 'pdf') {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
      } 
      else if (format === 'png') {
        const imgData = canvas.toDataURL("image/png");
        triggerDownload(imgData, `${fileName}.png`);
      } 
      else if (format === 'jpeg') {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        triggerDownload(imgData, `${fileName}.jpg`);
      }

    } catch (error) {
      console.error(`Failed to generate ${format.toUpperCase()}:`, error);
      alert(t("Failed to download certificate. Please try again."));
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerDownload = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`h-[100dvh] w-screen overflow-hidden flex flex-col items-center justify-center relative box-border transition-colors duration-500 ${isGenerated ? "bg-[#3b1212]" : "bg-[#16120c] p-4"}`}
    >
      {!isGenerated ? (
        <div className="w-full flex flex-col items-center z-10 animate-fade-in-up mt-[-10vh]">
          <h1 className="font-serif text-[#F5EAD4] text-[2.5rem] tracking-wide mb-6 drop-shadow-md">
            {t("Congratulations!")}
          </h1>

          <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl mb-4">
            <div className="bg-[#E0CCB6] rounded-xl pt-6 pb-8 px-6 flex flex-col items-center text-center">
              <p className="font-serif text-[#4A260F] text-[1.15rem] leading-snug mb-8">
                {t("To claim your certificate please enter your 'alias' for your appreciation.")}
              </p>

              <form
                onSubmit={handleGenerate}
                className="w-full flex flex-col items-center gap-8"
              >
                <input
                  type="text"
                  placeholder={t("Type Any Name Here...")}
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#4A260F]/60 text-center font-serif text-[#4A260F] text-lg pb-2 placeholder:text-[#4A260F]/50 focus:outline-none focus:border-[#4A260F] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#E0CCB6] border-2 border-[#4A260F] text-[#4A260F] rounded-lg px-8 py-2 font-serif text-[1.15rem] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[#4A260F]/5 active:scale-95 transition-all"
                >
                  {t("Redeem Prize")}
                </button>
              </form>
            </div>
          </div>

          <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl">
            <div className="bg-[#E0CCB6] rounded-xl py-4 px-5 text-center">
              <p className="font-serif text-[#4A260F] text-[1.05rem] leading-tight">
                {t("Note: All gold badges to get a special prize from us! We'll be by the entrance!")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in">
          
          {showDownloadModal && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4">
              <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl border border-white/10">
                <div className="bg-[#E0CCB6] rounded-xl py-8 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
                  <h3 className="font-serif text-[#4A260F] text-2xl font-bold mb-2">
                    {t("Save your Certificate!")}
                  </h3>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => handleDownload('pdf')} 
                      className="w-full bg-[#7A1515] text-[#E0CCB6] py-3 rounded-lg font-serif text-lg tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      {t("Download as PDF")}
                    </button>
                    <button 
                      onClick={() => handleDownload('png')} 
                      className="w-full bg-[#7A1515] text-[#E0CCB6] py-3 rounded-lg font-serif text-lg tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      {t("Download as PNG")}
                    </button>
                    <button 
                      onClick={() => handleDownload('jpeg')} 
                      className="w-full bg-[#7A1515] text-[#E0CCB6] py-3 rounded-lg font-serif text-lg tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      {t("Download as JPEG")}
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowDownloadModal(false)} 
                    className="mt-6 font-serif text-[#7A1515] underline text-sm hover:text-[#4A260F] transition-colors"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/end")}
            className="absolute top-6 right-6 text-white text-2xl font-serif hover:scale-110 transition-transform z-50"
          >
            X
          </button>

          {currentSlide === 0 && (
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50 hover:scale-110 transition-transform p-2"
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
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {currentSlide === 1 && (
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50 hover:scale-110 transition-transform p-2"
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
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div
            ref={certificateRef}
            className="relative w-[90%] max-w-[400px] aspect-auto bg-[#3b1212]"
          >
            <img
              src="/Group 45.svg"
              alt="Certificate Border"
              crossOrigin="anonymous"
              className="w-full h-full object-contain"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-[15%]">
              <div className="-mb-2 flex flex-col items-center w-full">
                <img
                  src="/logo_red.png"
                  alt="ArtiFact Logo"
                  crossOrigin="anonymous"
                  className="w-[20%] object-contain mb-[0%]"
                />
              </div>

              <h1
                className="font-agbalumo text-[#7A1515] leading-none mb-1 mt-1"
                style={{ fontSize: "clamp(2.5rem, 6vw, 2.75rem)" }}
              >
                {t("Certificate")}
              </h1>
              <h2
                className="font-agbalumo text-[#7A1515] leading-none mb-2"
                style={{ fontSize: "clamp(1.5rem, 4vw, 1.75rem)" }}
              >
                {t("of Appreciation")}
              </h2>

              <div className="w-1/2 border-t border-[#7A1515]/40 mb-1"></div>

              <h3
                className="font-birthstone text-[#7A1515] leading-none mb-1 break-all text-center"
                style={{ fontSize: "clamp(2rem, 12vw, 5rem)" }}
              >
                {visitorName}
              </h3>

              <div className="w-1/4 border-t border-[#7A1515]/40 mb-1"></div>

              <h4
                className="font-agbalumo text-[#7A1515] leading-none mb-0"
                style={{ fontSize: "clamp(0.8rem, 4vw, 1.5rem)" }}
              >
                “{t("ArtiFact Explorer")}”
              </h4>
              <p
                className="font-serif text-[#7A1515] font-bold m-0 p-1 leading-tight"
                style={{ fontSize: "clamp(0.4rem, 2vw, 0.6rem)" }}
              >
                {t("at the National Museum of Fine Arts")}
              </p>

              <div className="w-3/4 flex-col flex items-center justify-center mt-1 pb-10">
                {currentSlide === 0 ? (
                  <p
                    className="font-lora text-[#7A1515]/90 leading-tight text-justify"
                    style={{ fontSize: "clamp(0.55rem, 2.2vw, 0.75rem)" }}
                  >
                    {t("Congratulations on unlocking the badges! Thank you for testing ArtiFact and participating in our thesis project. Your time, support, and valuable feedback have greatly contributed to our research. We sincerely appreciate your participation.")}
                  </p>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="grid grid-cols-5 gap-2 mb-2 w-full px-2">
                      {[...Array(10)].map((_, i) => {
                        const badge = earnedBadges[i];
                        const isUnlocked = !!badge;
                        
                        let borderColor = "border-[#AA8855]/40";
                        if (isUnlocked) {
                          if (badge.badge_type === "Gold") borderColor = "border-[#E6BA39]";
                          else if (badge.badge_type === "Silver") borderColor = "border-[#C0C0C0]";
                          else borderColor = "border-[#CD7F32]"; 
                        }

                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-full flex items-center justify-center overflow-hidden border-[2px] ${
                              isUnlocked ? `${borderColor} bg-white shadow-md` : "bg-[#AA8855]/40 border-transparent shadow-inner"
                            }`}
                          >
                            {isUnlocked && badge.badge_url ? (
                              <CorsSafeImage 
                                src={badge.badge_url} 
                                alt="Badge" 
                                className="w-full h-full object-cover saturate-100" 
                              />
                            ) : isUnlocked ? (
                              <span className="text-[#AA8855]" style={{ fontSize: "clamp(0.6rem, 2vw, 1rem)" }}>★</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <p
                      className="font-agbalumo text-[#7A1515] leading-none"
                      style={{ fontSize: "clamp(0.75rem, 3.5vw, 1.1rem)" }}
                    >
                      {totalBadges} {t("Badges Collected")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 w-full flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrentSlide(0)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === 0 ? "w-10 bg-white" : "w-10 bg-white/30 hover:bg-white/50"}`}
              />
              <button
                onClick={() => setCurrentSlide(1)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === 1 ? "w-10 bg-white" : "w-10 bg-white/30 hover:bg-white/50"}`}
              />
            </div>

            <button
              onClick={() => setShowDownloadModal(true)}
              disabled={isDownloading}
              className={`absolute right-6 bottom-0 text-white transition-all ${isDownloading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
            >
              {isDownloading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;