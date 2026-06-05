import React, { useEffect, useRef, useState, useCallback } from "react";

const ArScanner = ({ onTargetFound, onTargetLost, unlockedByIndex }) => {
  const sceneRef = useRef(null);
  const targetRefs = useRef([]);
  const callbacksRef = useRef({ onTargetFound, onTargetLost });

  const [camStatus, setCamStatus] = useState("checking"); 

  useEffect(() => {
    callbacksRef.current = { onTargetFound, onTargetLost };
  }, [onTargetFound, onTargetLost]);

  const checkCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamStatus("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      setTimeout(() => {
        setCamStatus("granted");
      }, 400);
    } catch (err) {
      console.error("Camera access denied or failed:", err);
      setCamStatus("denied");
    }
  }, []);

  useEffect(() => {
    checkCamera();
  }, [checkCamera]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && camStatus === 'denied') {
        checkCamera();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [camStatus, checkCamera]);

  useEffect(() => {
    if (camStatus !== "granted") return;

    const handleTargetFound = (event) => {
      const index = parseInt(event.target.dataset.index);
      if (callbacksRef.current.onTargetFound)
        callbacksRef.current.onTargetFound(index);
    };

    const handleTargetLost = () => {
      if (callbacksRef.current.onTargetLost)
        callbacksRef.current.onTargetLost();
    };

    const validTargets = targetRefs.current.filter(Boolean);
    validTargets.forEach((target) => {
      target.addEventListener("targetFound", handleTargetFound);
      target.addEventListener("targetLost", handleTargetLost);
    });

    return () => {
      validTargets.forEach((target) => {
        target.removeEventListener("targetFound", handleTargetFound);
        target.removeEventListener("targetLost", handleTargetLost);
      });

      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach((track) => {
            track.stop(); 
            if (video.srcObject) video.srcObject.removeTrack(track);
          });
          video.srcObject = null;
        }
        video.remove(); 
      });

      if (sceneRef.current && sceneRef.current.systems) {
        const arSystem = sceneRef.current.systems["mindar-image-system"];
        if (arSystem) {
          try {
            if (arSystem.controller) {
              arSystem.stop();
            }
          } catch (e) {
            console.warn("MindAR cleanup bypassed to prevent crash:", e);
          }
        }
      }
    };
  }, [camStatus]);

  if (camStatus === "checking") {
    return (
      <div className="h-full w-full bg-[#16120c] flex items-center justify-center font-serif text-[#E0CCB6] animate-pulse relative z-50">
        Initializing AR Lens...
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>

            <h3 className="font-serif text-[#4A260F] text-2xl font-bold mb-3">
              Camera Access Required
            </h3>

            <p className="font-serif text-[#4A260F]/80 text-[15px] leading-relaxed mb-2">
              {camStatus === "denied"
                ? "ArtiFact requires camera permissions to scan the artworks."
                : "Your browser or device does not support the required AR camera features."}
            </p>

            {camStatus === "denied" && (
              <p className="font-serif text-[#4A260F] font-bold text-[14px] leading-relaxed mt-2 p-3 bg-[#4A260F]/10 rounded-lg">
                Please enable camera access in your device or browser settings.
                The scanner will automatically start when you return to this
                screen.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderTargets = () => {
    const targets = [];
    for (let i = 0; i < 15; i++) {
      const visibility = (unlockedByIndex && unlockedByIndex[i]) ? "false" : "true";

      targets.push(
        <a-entity 
          key={i} 
          ref={(el) => (targetRefs.current[i] = el)} 
          mindar-image-target={`targetIndex: ${i}`} 
          data-index={i}
        >
          <a-entity
            visible={visibility}
            animation="property: position; from: 0 0 0.02; to: 0 0 0.08; dir: alternate; dur: 4000; loop: true; easing: easeInOutQuad"
          >
            <a-text 
              value="???" 
              position="0 -0.2 0.05"
              align="center" 
              anchor="center" 
              baseline="center"
              color="#FFFFFF" 
              width="4" 
              scale="2.2 2.2 2.2"
              shader="msdf"
              font="https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/roboto/Roboto-Medium.json"
              outlineColor="#000000"
              outlineWidth="0.1"
            ></a-text>

            <a-text 
              value="???" 
              position="0.01 -0.2 0.005" 
              align="center" 
              anchor="center" 
              baseline="center"
              color="#000000" 
              width="4" 
              scale="2.2 2.2 2.2"
              shader="msdf"
              font="https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/roboto/Roboto-Medium.json"
            ></a-text>
          </a-entity>
        </a-entity>
      );
    }
    return targets;
  };

  return (
    <div className="absolute inset-0 z-0">
      <a-scene
        embedded
        ref={sceneRef}
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiLoading: no; uiError: no; filterMinCF: 0.0001; filterBeta: 0.001;"
        color-space="sRGB"
        renderer="antialias: false; precision: mediump; colorManagement: true;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        {renderTargets()}
      </a-scene>
    </div>
  );
};

export default ArScanner;
