import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

const TARGET_COUNT = 30;

const ArScanner = ({ onTargetFound, onTargetLost, unlockedByIndex }) => {
  const { t } = useTranslation();
  const sceneRef = useRef(null);
  const targetRefs = useRef([]);
  const floatingRefs = useRef([]);

  const callbacksRef = useRef({
    onTargetFound,
    onTargetLost,
  });

  const [camStatus, setCamStatus] = useState("checking");

  useEffect(() => {
    callbacksRef.current = {
      onTargetFound,
      onTargetLost,
    };
  }, [onTargetFound, onTargetLost]);

  const checkCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamStatus("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      stream.getTracks().forEach((track) => track.stop());

      setTimeout(() => {
        setCamStatus("granted");
      }, 300);
    } catch {
      setCamStatus("denied");
    }
  }, []);

  useEffect(() => {
    checkCamera();
  }, [checkCamera]);

  useEffect(() => {
    if (camStatus !== "denied") return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [camStatus, checkCamera]);

  useEffect(() => {
    if (camStatus !== "granted") return;

    const handleFound = (e) => {
      const index = Number(e.target.dataset.index);
      const floating = floatingRefs.current[index];

      if (floating) {
        floating.setAttribute(
          "animation",
          `
          property: position;
          from: 0 0 0.03;
          to: 0 0.02 0.03;
          dir: alternate;
          dur: 2500;
          easing: easeInOutQuad;
          loop: true;
        `,
        );
      }

      callbacksRef.current.onTargetFound?.(index);
    };

    const handleLost = (e) => {
      const index = Number(e.target.dataset.index);
      const floating = floatingRefs.current[index];

      if (floating) {
        floating.removeAttribute("animation");
        floating.setAttribute("position", "0 0 0");
      }

      callbacksRef.current.onTargetLost?.();
    };

    const targets = targetRefs.current.filter(Boolean);

    targets.forEach((target) => {
      target.addEventListener("targetFound", handleFound);
      target.addEventListener("targetLost", handleLost);
    });

    return () => {
      targets.forEach((target) => {
        target.removeEventListener("targetFound", handleFound);
        target.removeEventListener("targetLost", handleLost);
      });

      document.querySelectorAll("video").forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
        video.remove();
      });

      const arSystem = sceneRef.current?.systems?.["mindar-image-system"];
      if (arSystem) {
        try {
          arSystem.stop();
        } catch (err) {
          console.warn("MindAR cleanup bypassed:", err);
        }
      }
    };
  }, [camStatus]);

  if (camStatus === "checking") {
    return (
      <div className="h-full w-full bg-[#16120c] flex items-center justify-center font-serif text-[#E0CCB6] animate-pulse relative z-50">
        {t("Initializing AR...")}
      </div>
    );
  }

  if (camStatus === "denied" || camStatus === "unsupported") {
    return (
      <div className="h-full w-full bg-[#16120c] flex flex-col items-center justify-center p-6 relative z-50">
        <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl">
          <div className="bg-[#E0CCB6] rounded-xl py-8 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
            <div className="w-16 h-16 rounded-full bg-[#4A260F]/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#4A260F] animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97a9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>

            <h3 className="font-serif text-[#4A260F] text-2xl font-bold mb-3">
              {t("Camera Access Required")}
            </h3>

            <p className="font-serif text-[#4A260F]/80 text-[15px] leading-relaxed mb-2">
              {camStatus === "denied"
                ? t(
                    "ArtiFact requires camera permissions to scan the artworks.",
                  )
                : t(
                    "Your browser or device does not support the required AR camera features.",
                  )}
            </p>

            {camStatus === "denied" && (
              <p className="font-serif text-[#4A260F] font-bold text-[14px] leading-relaxed mt-2 p-3 bg-[#4A260F]/10 rounded-lg">
                {t("Please enable camera access in your browser settings.")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <a-scene
        embedded
        ref={sceneRef}
        mindar-image="imageTargetSrc: https://tpsrtvvynigljdnbhcuj.supabase.co/storage/v1/object/public/ar-assets/targets.mind?t=${Date.now()}; autoStart: true; uiLoading: no; uiError: no;"
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
      >
        <a-assets>
          <img
            id="questionMark"
            src="/questionmark.png"
            crossOrigin="anonymous"
            alt="target"
          />
        </a-assets>

        <a-camera
          position="0 0 0"
          look-controls="enabled: false"
          wasd-controls="enabled: false"
        />

        {Array.from({ length: TARGET_COUNT }, (_, i) => {
          return (
            <a-entity
              key={i}
              ref={(el) => (targetRefs.current[i] = el)}
              mindar-image-target={`targetIndex: ${i}`}
              data-index={i}
            >
              {!unlockedByIndex?.[i] && (
                <a-entity
                  ref={(el) => (floatingRefs.current[i] = el)}
                  position="0 0 0.03"
                >
                  <a-plane
                    src="#questionMark"
                    position="0 0 0"
                    width="0.9"
                    height="0.45"
                    transparent="true"
                    material="alphaTest: 0.01; side: double;"
                  ></a-plane>
                </a-entity>
              )}
            </a-entity>
          );
        })}
      </a-scene>
    </div>
  );
};

export default React.memo(ArScanner);
