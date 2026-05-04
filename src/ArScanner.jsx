import React, { useEffect, useRef } from 'react';

// Map each painting index to its sound file
const PAINTING_SOUNDS = {
  0: '/sounds/painting-0.mp3',
  1: '/sounds/painting-1.mp3',
  2: '/sounds/painting-2.mp3',
  // add more sounds yeah (public/sounds)
};

const ArScanner = ({ onTargetFound, onTargetLost }) => {
  const sceneRef = useRef(null);
  const callbacksRef = useRef({ onTargetFound, onTargetLost });
  const audioRef = useRef(null); // Tracks currently playing audio
 
  // Keep callbacks ref in sync without re-running the effect
  useEffect(() => {
    callbacksRef.current = { onTargetFound, onTargetLost };
  }, [onTargetFound, onTargetLost]);
 
  useEffect(() => {
    const targets = document.querySelectorAll('[mindar-image-target]');
 
    const stopCurrentAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
 
    const handleTargetFound = (event) => {
      const index = parseInt(event.target.dataset.index);
      console.log(`Painting Detected! Index: ${index}`);
 
      // Stop any currently playing sound first
      stopCurrentAudio();
 
      // Play the sound mapped to this specific painting
      const soundSrc = PAINTING_SOUNDS[index];
      if (soundSrc) {
        const audio = new Audio(soundSrc);
        audio.play().catch((err) =>
          console.warn(`Audio play failed for painting ${index}:`, err)
        );
        audioRef.current = audio;
 
        // Clean up ref when audio finishes naturally
        audio.addEventListener('ended', () => {
          audioRef.current = null;
        });
      }
 
      if (callbacksRef.current.onTargetFound) {
        callbacksRef.current.onTargetFound(index);
      }
    };
 
    const handleTargetLost = () => {
      console.log('Target Lost!');
 
      // Stop sound when painting goes out of frame
      stopCurrentAudio();
 
      if (callbacksRef.current.onTargetLost) {
        callbacksRef.current.onTargetLost();
      }
    };
 
    targets.forEach((target) => {
      target.addEventListener('targetFound', handleTargetFound);
      target.addEventListener('targetLost', handleTargetLost);
    });
 
    return () => {
      // Remove event listeners
      targets.forEach((target) => {
        target.removeEventListener('targetFound', handleTargetFound);
        target.removeEventListener('targetLost', handleTargetLost);
      });
 
      // Stop any playing audio on unmount
      stopCurrentAudio();
 
      // Stop camera tracks
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track) => track.stop());
        }
      });
 
      // Stop MindAR system
      if (
        sceneRef.current &&
        sceneRef.current.systems['mindar-image-system']
      ) {
        try {
          sceneRef.current.systems['mindar-image-system'].stop();
        } catch (err) {
          console.log('MindAR cleanup caught safely.');
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