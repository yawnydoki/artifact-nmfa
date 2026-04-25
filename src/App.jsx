import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Added Framer Motion

import LoadingScreen from './LoadingScreen';
import Dashboard from './Dashboard';
import MuseumMap from './MuseumMap';
import QuizScreen from './QuizScreen';
import Passport from './Passport';
import EndSequence from './EndSequence';
import BottomNav from './BottomNav';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageWrapper><Dashboard /></PageWrapper>
        } />
        <Route path="/map" element={
          <PageWrapper><MuseumMap /></PageWrapper>
        } />
        <Route path="/quiz" element={
          <PageWrapper><QuizScreen /></PageWrapper>
        } />
        <Route path="/passport" element={
          <PageWrapper><Passport /></PageWrapper>
        } />
        <Route path="/end" element={
          <PageWrapper><EndSequence /></PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => {
  return (
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
};

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) return <LoadingScreen />;

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