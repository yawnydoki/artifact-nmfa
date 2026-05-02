import React, { useEffect, useRef } from 'react';

const ArScanner = ({ onTargetFound, onTargetLost }) => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Grab all 10 dynamically generated target entities
    const targets = document.querySelectorAll('[mindar-image-target]');
    
    const handleTargetFound = (event) => {
      // Safely grab the standard HTML data attribute
      const index = parseInt(event.target.dataset.index);
      
      console.log(`Painting Detected! Index: ${index}`);
      if (onTargetFound) onTargetFound(index);
    };

    const handleTargetLost = () => {
      console.log('Target Lost!');
      if (onTargetLost) onTargetLost();
    };

    // Attach listeners to every single target
    targets.forEach((target) => {
      target.addEventListener('targetFound', handleTargetFound);
      target.addEventListener('targetLost', handleTargetLost);
    });

    // --- CRITICAL CLEANUP BLOCK (Prevents battery drain & React unmount crashes) ---
    return () => {
      // 1. Remove the listeners so they don't fire after the component is destroyed
      targets.forEach((target) => {
        target.removeEventListener('targetFound', handleTargetFound);
        target.removeEventListener('targetLost', handleTargetLost);
      });

      // 2. FORCE KILL THE CAMERA
      // This guarantees the green camera light turns off on the user's phone
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => {
            track.stop();
          });
        }
      });
      
      // 3. Gracefully stop the A-Frame AR System if it exists
      if (sceneRef.current && sceneRef.current.systems["mindar-image-system"]) {
        try {
          sceneRef.current.systems["mindar-image-system"].stop();
        } catch (err) {
          // Silently catch the controller error so it doesn't crash the React app
          console.log("MindAR cleanup caught safely.");
        }
      }
    };
  }, [onTargetFound, onTargetLost]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <a-scene 
        ref={sceneRef}
        // NOTE: Make sure your targets.mind file in the public folder has all 10 images compiled!
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiScanning: no; uiLoading: no; filterMinCF: 0.0001; filterBeta: 0.001;" 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        
        {/* We dynamically create 10 targets (Indexes 0 through 9) */}
        {[...Array(10)].map((_, i) => (
          <a-entity 
            key={i} 
            data-index={i} 
            mindar-image-target={`targetIndex: ${i}`}
          >
            {/* 
              This is a semi-transparent yellow overlay that will appear ON the physical painting
              in the real world when the camera recognizes it. 
              You can remove this <a-plane> if you don't want any visual AR overlay.
            */}
            <a-plane 
              color="#E6BA39" 
              opacity="0.2" 
              position="0 0 0" 
              height="0.552" 
              width="1" 
              rotation="0 0 0"
            ></a-plane>
          </a-entity>
        ))}

      </a-scene>
    </div>
  );
};

export default ArScanner;