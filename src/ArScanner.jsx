import React, { useEffect, useRef } from 'react';

const ArScanner = ({ onTargetFound, onTargetLost }) => {
  const sceneRef = useRef(null);

  const callbacksRef = useRef({ onTargetFound, onTargetLost });

  useEffect(() => {
    const targets = document.querySelectorAll('[mindar-image-target]');
    
    const handleTargetFound = (event) => {
      const index = parseInt(event.target.dataset.index);
      
      console.log(`Painting Detected! Index: ${index}`);
      if (callbacksRef.current.onTargetFound) callbacksRef.current.onTargetFound(index);
    };

    const handleTargetLost = () => {
      console.log('Target Lost!');
      if (callbacksRef.current.onTargetLost) callbacksRef.current.onTargetLost();
    };

    targets.forEach((target) => {
      target.addEventListener('targetFound', handleTargetFound);
      target.addEventListener('targetLost', handleTargetLost);
    });

    return () => {
      targets.forEach((target) => {
        target.removeEventListener('targetFound', handleTargetFound);
        target.removeEventListener('targetLost', handleTargetLost);
      });

      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => {
            track.stop();
          });
        }
      });
      
      if (sceneRef.current && sceneRef.current.systems["mindar-image-system"]) {
        try {
          sceneRef.current.systems["mindar-image-system"].stop();
        } catch (err) {
          console.log("MindAR cleanup caught safely.");
        }
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <a-scene 
        ref={sceneRef}
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiScanning: no; uiLoading: no; filterMinCF: 0.0001; filterBeta: 0.001;" 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        
        {[...Array(10)].map((_, i) => (
          <a-entity 
            key={i} 
            data-index={i} 
            mindar-image-target={`targetIndex: ${i}`}
          >
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