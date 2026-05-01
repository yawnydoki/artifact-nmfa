import React, { useEffect, useRef } from 'react';

const ArScanner = ({ onTargetFound, onTargetLost }) => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // We need to attach listeners to the specific target entities, not just the scene
    const targets = document.querySelectorAll('[mindar-image-target]');
    
    const handleTargetFound = (event) => {
      // Safely grab the standard HTML data attribute instead!
      const index = parseInt(event.target.dataset.index);
      
      console.log(`Painting Detected! Index: ${index}`);
      if (onTargetFound) onTargetFound(index);
    };

    const handleTargetLost = () => {
      console.log('Target Lost!');
      if (onTargetLost) onTargetLost();
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
    };
  }, [onTargetFound, onTargetLost]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <a-scene 
        ref={sceneRef}
        // NOTE: Make sure your targets.mind file in the public folder has all 10 images!
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiScanning: no; uiLoading: no;" 
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
            data-index={i} /* <-- ADD THIS LINE HERE */
            mindar-image-target={`targetIndex: ${i}`}
          >
            <a-plane color="#E6BA39" opacity="0.5" position="0 0 0" height="0.552" width="1" rotation="0 0 0"></a-plane>
          </a-entity>
        ))}

      </a-scene>
    </div>
  );
};

export default ArScanner;