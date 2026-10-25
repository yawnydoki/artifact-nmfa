import React, { createContext, useContext, useState } from 'react';
import { supabase } from './supabaseClient.js';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const readCachedBadges = () => {
  try {
    return JSON.parse(localStorage.getItem('artifact_cached_badges') || '[]');
  } catch (error) {
    console.error("Failed to parse cached badges", error);
    return [];
  }
};

const applyBadgeData = (setUnlockedBadges, badges) => {
  const normalizedBadges = (badges || []).map((badge) => ({
    ...badge,
    artwork_id: String(badge.artwork_id),
  }));
  setUnlockedBadges(normalizedBadges);
  localStorage.setItem('artifact_cached_badges', JSON.stringify(normalizedBadges));
};

export const DataProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState(() =>
    readCachedBadges().map((badge) => ({
      ...badge,
      artwork_id: String(badge.artwork_id),
    })),
  );
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadInitialData = async (visitorId) => {
    setIsDataLoading(true);
    try {
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: true });
        
      if (artworksError) throw artworksError;
      
      if (artworksData) {
        setArtworks(artworksData);
        localStorage.setItem('artifact_cached_artworks', JSON.stringify(artworksData));
      }

      if (visitorId) {
        const { data: badgesData, error: badgesError } = await supabase
          .from('unlocked_badges')
          .select('artwork_id, badge_type, created_at')
          .eq('visitor_id', visitorId);
          
        if (badgesError) throw badgesError;
        
        if (badgesData) {
          applyBadgeData(setUnlockedBadges, badgesData);
        }
      }
    } catch (err) {
      console.warn("Network or Supabase error. Defaulting to offline cache:", err.message);
      
      const cachedArtworks = localStorage.getItem('artifact_cached_artworks');
      if (cachedArtworks) {
        try {
          setArtworks(JSON.parse(cachedArtworks));
        } catch (e) {
          console.error("Failed to parse cached artworks", e);
        }
      }

      applyBadgeData(setUnlockedBadges, readCachedBadges());
    } finally {
      setIsDataLoading(false);
    }
  };

  const refreshBadges = async () => {
    const visitorId = localStorage.getItem('artifact_visitor_id');
    if (!visitorId) return;
    try {
      const { data, error } = await supabase
        .from('unlocked_badges')
        .select('artwork_id, badge_type, created_at')
        .eq('visitor_id', visitorId);
        
      if (error) throw error;
      
      if (data) {
        applyBadgeData(setUnlockedBadges, data);
      }
    } catch (err) {
      console.warn("Error refreshing badges from server. Checking local cache:", err.message);
      
      applyBadgeData(setUnlockedBadges, readCachedBadges());
    }
  };

  return (
    <DataContext.Provider value={{ artworks, unlockedBadges, isDataLoading, loadInitialData, refreshBadges }}>
      {children}
    </DataContext.Provider>
  );
};
