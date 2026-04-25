import React, { useEffect, useRef } from 'react';

const ArScanner = ({ onTargetFound, onTargetLost }) => {
  const sceneRef = useRef(null);

  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    // Listen for when the MindAR engine detects the target image
    sceneEl.addEventListener('targetFound', () => {
      console.log('Target Found!');
      if (onTargetFound) onTargetFound();
    });

    sceneEl.addEventListener('targetLost', () => {
      console.log('Target Lost!');
      if (onTargetLost) onTargetLost();
    });

    return () => {
      sceneEl.removeEventListener('targetFound', onTargetFound);
      sceneEl.removeEventListener('targetLost', onTargetLost);
    };
  }, [onTargetFound, onTargetLost]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* The a-scene tag initializes MindAR. 
        Note: We are using a default test image provided by MindAR.
        When you compile your painting targets, change the src to "/targets.mind" 
      */}
      <a-scene 
        ref={sceneRef}
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiScanning: no; uiLoading: no;" 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        
        {/* The target entity. When targetIndex 0 is found, it triggers the event */}
        <a-entity mindar-image-target="targetIndex: 0">
          <a-plane color="#E6BA39" opacity="0.5" position="0 0 0" height="0.552" width="1" rotation="0 0 0"></a-plane>
        </a-entity>
      </a-scene>
    </div>
  );
};

export default ArScanner;