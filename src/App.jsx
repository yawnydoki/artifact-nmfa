import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient.js";
import { useData } from "./DataContext";

import LoadingScreen from "./LoadingScreen";
import BottomNav from "./BottomNav";
import TutorialModal from "./TutorialModal";
import AdminRoute from "./AdminRoute";
import { useGatepass } from "./GatepassContext";
import GatepassScreen from "./GatepassScreen";

const Dashboard = lazy(() => import("./Dashboard"));
const MuseumMap = lazy(() => import("./MuseumMap"));
const QuizScreen = lazy(() => import("./QuizScreen"));
const Passport = lazy(() => import("./Passport"));
const EndPrompt = lazy(() => import("./EndPrompt"));
const EndSequence = lazy(() => import("./EndSequence"));
const Certificate = lazy(() => import("./Certificate"));
const AdminLogin = lazy(() => import("./AdminLogin"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { hasPass, validateScannedToken } = useGatepass();  

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                {hasPass ? (
                  <Dashboard />
                ) : (
                  <GatepassScreen onVerify={validateScannedToken} />
                )}
              </PageWrapper>
            }
          />

          <Route
            path="/map"
            element={
              <PageWrapper>
                <MuseumMap />
              </PageWrapper>
            }
          />
          <Route
            path="/quiz"
            element={
              <PageWrapper>
                <QuizScreen />
              </PageWrapper>
            }
          />
          <Route
            path="/passport"
            element={
              <PageWrapper>
                <Passport />
              </PageWrapper>
            }
          />
          <Route
            path="/end-prompt"
            element={
              <PageWrapper>
                <EndPrompt />
              </PageWrapper>
            }
          />
          <Route
            path="/end"
            element={
              <PageWrapper>
                <EndSequence />
              </PageWrapper>
            }
          />
          <Route
            path="/Certificate"
            element={
              <PageWrapper>
                <Certificate />
              </PageWrapper>
            }
          />

          <Route
            path="/admin/login"
            element={
              isAdminRoute ? (
                <AdminLogin />
              ) : (
                <PageWrapper>
                  <AdminLogin />
                </PageWrapper>
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

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
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [initError, setInitError] = useState(false);
  const { loadInitialData } = useData();
  const [showTutorial, setShowTutorial] = useState(false);

  const syncOfflineQueue = async () => {
    if (!navigator.onLine) return;
    const queue = JSON.parse(
      localStorage.getItem("artifact_offline_queue") || "[]",
    );
    if (queue.length === 0) return;

    const visitorId = localStorage.getItem("artifact_visitor_id");
    if (!visitorId) return;

    try {
      const insertData = queue.map((b) => ({
        visitor_id: visitorId,
        artwork_id: b.artwork_id,
        badge_type: b.badge_type,
      }));

      const { error } = await supabase
        .from("unlocked_badges")
        .upsert(insertData, { onConflict: "visitor_id,artwork_id" });

      if (error) throw error;
      localStorage.removeItem("artifact_offline_queue");
      await loadInitialData(visitorId);
    } catch (err) {
      console.error("Failed to sync offline queue:", err.message);
    }
  };

  const initializeApp = async () => {
    setInitError(false);
    setIsAppLoading(true);

    try {
      let visitorId = localStorage.getItem("artifact_visitor_id");

      if (visitorId) {
        const { data, error } = await supabase
          .from("visitors")
          .select("id")
          .eq("id", visitorId)
          .maybeSingle();

        if (error || !data) {
          visitorId = null;
          localStorage.removeItem("artifact_visitor_id");
        }
      }

      if (!visitorId) {
        visitorId = uuidv4();
        const { error } = await supabase
          .from("visitors")
          .insert([{ id: visitorId }]);
        if (error) throw error;
        localStorage.setItem("artifact_visitor_id", visitorId);
      }

      await loadInitialData(visitorId);
      setIsAppLoading(false);
    } catch (err) {
      console.error("Error initializing app:", err.message);
      let visitorId = localStorage.getItem("artifact_visitor_id");
      if (visitorId) {
        await loadInitialData(visitorId);
        setIsAppLoading(false);
      } else {
        setInitError(true);
      }
    }
  };

  useEffect(() => {
    initializeApp();
    const hasSeenTutorial = localStorage.getItem("artifact_has_seen_tutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    syncOfflineQueue();

    window.addEventListener("online", syncOfflineQueue);
    return () => {
      window.removeEventListener("online", syncOfflineQueue);
    };
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("artifact_has_seen_tutorial", "true");
  };

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  if (showLoadingScreen && !isAdminRoute) {
    return (
      <LoadingScreen
        hasError={initError}
        isDataReady={!isAppLoading}
        onComplete={() => setShowLoadingScreen(false)}
        onRetry={initializeApp}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="relative w-screen h-[100dvh] overflow-hidden bg-artifact-bg">
        <AnimatedRoutes />
        <BottomNav />
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
