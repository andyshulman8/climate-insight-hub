import { useState, useEffect } from "react";
import { AnalysisResponse } from "@/lib/api";

export interface ArticleHistoryItem {
  id: string;
  title: string;
  content: string;
  analysis: AnalysisResponse;
  timestamp: number;
}

const STORAGE_KEY = "climate-news-article-history";

export function useArticleHistory() {
  const [history, setHistory] = useState<ArticleHistoryItem[]>(() => {
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addArticle = (content: string, analysis: AnalysisResponse) => {
    const title = content.slice(0, 60).trim() + (content.length > 60 ? "..." : "");
    const newItem: ArticleHistoryItem = {
      id: crypto.randomUUID(),
      title,
      content,
      analysis,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const removeArticle = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getArticle = (id: string) => {
    return history.find((item) => item.id === id);
  };

  return {
    history,
    addArticle,
    removeArticle,
    clearHistory,
    getArticle,
  };
}
