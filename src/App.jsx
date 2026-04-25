import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

// Screen Imports
import LoadingScreen from './LoadingScreen';
import Dashboard from './Dashboard';
import MuseumMap from './MuseumMap';
import QuizScreen from './QuizScreen';
import Passport from './Passport';
import EndSequence from './EndSequence';
import BottomNav from './BottomNav';

// Wrapper for the routes to handle animations properly
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><MuseumMap /></PageWrapper>} />
        <Route path="/quiz" element={<PageWrapper><QuizScreen /></PageWrapper>} />
        <Route path="/passport" element={<PageWrapper><Passport /></PageWrapper>} />
        <Route path="/end" element={<PageWrapper><EndSequence /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

// Reusable animation wrapper for every page
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="absolute inset-0 w-full h-full"
  >
    {children}
  </motion.div>
);

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // 1. Invisible User Registration
    const initializeVisitor = async () => {
      let visitorId = localStorage.getItem('artifact_visitor_id');

      if (!visitorId) {
        visitorId = uuidv4();
        try {
          const { error } = await supabase
            .from('visitors')
            .insert([{ id: visitorId }]);
            
          if (error) throw error;
          
          localStorage.setItem('artifact_visitor_id', visitorId);
          console.log("New anonymous visitor registered!");
        } catch (err) {
          console.error("Error registering visitor:", err.message);
        }
      } else {
        console.log("Welcome back, visitor:", visitorId);
      }
    };

    initializeVisitor();

    // 2. Loading Screen Timer
    const timer = setTimeout(() => setIsAppLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (isAppLoading) return <LoadingScreen />;

  // Render the actual app
  return (
    <BrowserRouter>
      <div className="relative w-screen h-screen overflow-hidden bg-[#16120c]">
        <AnimatedRoutes />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;