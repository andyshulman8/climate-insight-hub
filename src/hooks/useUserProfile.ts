import { useState, useEffect } from "react";

export interface UserProfile {
  climateConcerns: string;
  geographicFocus: string;
  interestCategories: string;
  conversationHistory: string[];
  sessionId: string;
}

const STORAGE_KEY = "climate-news-profile";

const defaultProfile: UserProfile = {
  climateConcerns: "",
  geographicFocus: "",
  interestCategories: "",
  conversationHistory: [],
  sessionId: crypto.randomUUID(),
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window === "undefined") return defaultProfile;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addToHistory = (message: string) => {
    setProfile((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  };

  const clearProfile = () => {
    setProfile({ ...defaultProfile, sessionId: crypto.randomUUID() });
  };

  const isProfileComplete = Boolean(
    profile.climateConcerns && profile.geographicFocus && profile.interestCategories
  );

  return {
    profile,
    updateProfile,
    addToHistory,
    clearProfile,
    isProfileComplete,
  };
}
