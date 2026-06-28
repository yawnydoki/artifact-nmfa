import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

const GatepassContext = createContext();

export const useGatepass = () => useContext(GatepassContext);

export const GatepassProvider = ({ children }) => {
  const [hasPass, setHasPass] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkSavedPass = () => {
      const savedToken = localStorage.getItem('artifact_daily_token');
      const tokenDate = localStorage.getItem('artifact_token_date');
      const today = new Date().toLocaleDateString('en-CA');

      if (savedToken && tokenDate === today) {
        console.log("[Gatepass Engine] Active valid cached user token confirmed for date row:", today);
        setHasPass(true);
      } else {
        localStorage.removeItem('artifact_daily_token');
        localStorage.removeItem('artifact_token_date');
        setHasPass(false);
      }
      setIsVerifying(false);
    };

    checkSavedPass();
  }, []);

  const validateScannedToken = async (scannedHash) => {
    if (!scannedHash) {
      console.warn("[Gatepass Validation] Aborted check: Scanned text value evaluated as empty.");
      return false;
    }
    
    const cleanScanned = scannedHash.trim();
    const todayLocal = new Date().toLocaleDateString('en-CA');
    console.log(`[Gatepass Validation] Querying Supabase lookup for token payload matching: "${cleanScanned}"`);

    try {
      const { data, error } = await supabase
        .from('daily_gatepass')
        .select('valid_date, token_hash')
        .eq('token_hash', cleanScanned)
        .maybeSingle();

      if (error) {
        console.error("[Gatepass Validation] Supabase backend evaluation failed:", error.message);
        throw new Error(`Database Error Context: ${error.message}`);
      }

      if (!data) {
        console.warn(`[Gatepass Validation] Zero records returned for search value "${cleanScanned}"`);
        throw new Error("No matching code entry registered in daily_gatepass rows.");
      }

      console.log(`[Gatepass Validation] Match found! Stored Row Date: "${data.valid_date}", System Local Date: "${todayLocal}"`);

      if (data.valid_date === todayLocal) {
        localStorage.setItem('artifact_daily_token', cleanScanned);
        localStorage.setItem('artifact_token_date', todayLocal);
        setHasPass(true);
        return true;
      }

      throw new Error(`Token match is outdated. Row date: ${data.valid_date}, Device clock date: ${todayLocal}`);
    } catch (err) {
      console.error("[Gatepass Validation] Internal execution failure:", err.message);
      throw err;
    }
  };

  return (
    <GatepassContext.Provider value={{ hasPass, isVerifying, validateScannedToken }}>
      {children}
    </GatepassContext.Provider>
  );
};