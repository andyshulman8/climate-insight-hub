import { useState, useEffect } from "react";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";

const STORAGE_KEY = "climate-news-favorites";
const TAGS_STORAGE_KEY = "climate-news-favorite-tags";

export interface FavoriteTag {
  label: string;
  type: 'concern' | 'category' | 'geographic';
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<ArticleHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [favoriteTags, setFavoriteTags] = useState<FavoriteTag[]>(() => {
    if (typeof window === "undefined") return [];
    
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(favoriteTags));
  }, [favoriteTags]);

  const addFavorite = (item: ArticleHistoryItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  const addFavoriteTag = (tag: FavoriteTag) => {
    setFavoriteTags((prev) => {
      if (prev.some((t) => t.label === tag.label && t.type === tag.type)) return prev;
      return [tag, ...prev];
    });
  };

  const removeFavoriteTag = (label: string, type: string) => {
    setFavoriteTags((prev) => prev.filter((t) => !(t.label === label && t.type === type)));
  };

  const isTagFavorite = (label: string, type: string) => {
    return favoriteTags.some((t) => t.label === label && t.type === type);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    favoriteTags,
    addFavoriteTag,
    removeFavoriteTag,
    isTagFavorite,
  };
}
