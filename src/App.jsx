import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoadingScreen from './LoadingScreen';
import Dashboard from './Dashboard';
import MuseumMap from './MuseumMap';
import QuizScreen from './QuizScreen';
import Passport from './Passport';
import EndSequence from './EndSequence';
import BottomNav from './BottomNav';

function App() {
  // State to manage the global loading sequence
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // If the app is still loading, ONLY show the loading screen
  if (isAppLoading) {
    return <LoadingScreen />;
  }

  // Once loading is done, show the actual app with routing
  return (
    <BrowserRouter>
      <div className="relative w-screen h-screen overflow-hidden">
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MuseumMap />} />
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/end" element={<EndSequence />} />
        </Routes>

        {/* The shared navigation bar */}
        <BottomNav />
        
      </div>
    </BrowserRouter>
  );
}

export default App; 