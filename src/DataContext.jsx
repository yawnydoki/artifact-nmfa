import React, { createContext, useContext, useState } from 'react';
import { supabase } from './supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadInitialData = async (visitorId) => {
    setIsDataLoading(true);
    try {
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: true });
        
      if (artworksError) throw artworksError;
      if (artworksData) setArtworks(artworksData);

      if (visitorId) {
        const { data: badgesData, error: badgesError } = await supabase
          .from('unlocked_badges')
          .select('artwork_id, badge_type, created_at')
          .eq('visitor_id', visitorId);
          
        if (badgesError) throw badgesError;
        if (badgesData) setUnlockedBadges(badgesData);
      }
    } catch (err) {
      console.error("Error loading cache:", err.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  const refreshBadges = async () => {
    const visitorId = localStorage.getItem('artifact_visitor_id');
    if (!visitorId) return;
    try {
      const { data } = await supabase
        .from('unlocked_badges')
        .select('artwork_id, badge_type, created_at')
        .eq('visitor_id', visitorId);
      if (data) setUnlockedBadges(data);
    } catch (err) {
      console.error("Error refreshing badges:", err.message);
    }
  };

  return (
    <DataContext.Provider value={{ artworks, unlockedBadges, isDataLoading, loadInitialData, refreshBadges }}>
      {children}
    </DataContext.Provider>
  );
};