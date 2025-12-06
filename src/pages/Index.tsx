import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, User, FileText, Loader2, Target, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArticleHistorySidebar } from "@/components/ArticleHistorySidebar";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useArticleHistory, ArticleHistoryItem } from "@/hooks/useArticleHistory";
import {
  articleAnalysis,
  normalizeResponseField,
  type AnalysisResponse,
  ApiError,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { profile, isProfileComplete } = useUserProfile();
  const { history, addArticle, removeArticle, getArticle } = useArticleHistory();
  
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!articleContent.trim()) {
      toast({
        title: "Article Required",
        description: "Please paste an article to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setSelectedHistoryId(null);

    try {
      const result = await articleAnalysis({
        user_concerns: profile.climateConcerns || "general climate change",
        article_content: articleContent,
        user_categories: profile.interestCategories || "all",
        user_geographic_focus: profile.geographicFocus || "global",
      });

      if (result.success) {
        const normalized = normalizeResponseField<AnalysisResponse>(result.response);
        setAnalysis(normalized);
        const newItem = addArticle(articleContent, normalized);
        setSelectedHistoryId(newItem.id);
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "API Limit Reached",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Error",
          description: error instanceof Error ? error.message : "Failed to analyze article",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: ArticleHistoryItem) => {
    setSelectedHistoryId(item.id);
    setArticleContent(item.content);
    setAnalysis(item.analysis);
  };

  const handleNewAnalysis = () => {
    setSelectedHistoryId(null);
    setArticleContent("");
    setAnalysis(null);
  };

  const handleDeleteHistory = (id: string) => {
    removeArticle(id);
    if (selectedHistoryId === id) {
      handleNewAnalysis();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-subtle">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0">
        <ArticleHistorySidebar
          history={history}
          selectedId={selectedHistoryId}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onNewAnalysis={handleNewAnalysis}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="shrink-0 border-b border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  Climate News Translator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Powered by Kith AI
                </p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="icon" aria-label="Edit profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {/* Profile Warning */}
            {!isProfileComplete && (
              <Card variant="outline" className="border-amber/50 bg-amber/5 animate-fade-in">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertTriangle className="h-5 w-5 text-amber shrink-0" />
                  <p className="text-sm text-foreground flex-1">
                    Set up your profile for personalized analysis
                  </p>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      Set Up Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Compact Article Input */}
            <Card variant="elevated" className="animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Analyze Climate Article
                </CardTitle>
                <CardDescription>
                  Paste a climate news article to get personalized analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Paste the full text of a climate news article here..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <Button
                  variant="hero"
                  onClick={handleAnalyze}
                  disabled={isLoading || !articleContent.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Analyze Article
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && <AnalysisResults analysis={analysis} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
