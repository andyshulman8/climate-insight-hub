import { useState } from "react";
import { Link } from "react-router-dom";
import { User, FileText, Loader2, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArticleHistorySidebar } from "@/components/ArticleHistorySidebar";
import { AnalysisResults } from "@/components/AnalysisResults";
import { NewsFeed } from "@/components/NewsFeed";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useArticleHistory, ArticleHistoryItem } from "@/hooks/useArticleHistory";
import {
  articleAnalysis,
  normalizeResponseField,
  type AnalysisResponse,
  ApiError,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Index = () => {
  const { profile, updateProfile, isProfileComplete } = useUserProfile();
  const { history, addArticle, removeArticle, clearHistory } = useArticleHistory();
  
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handlePasteFromNews = (text: string) => {
    setArticleContent(text);
    setAnalysis(null);
    setSelectedHistoryId(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    handleNewAnalysis();
  };

  const handleAddTagToProfile = (tag: string, type: 'concern' | 'category' | 'geographic') => {
    const currentValue = type === 'concern' 
      ? profile.climateConcerns 
      : type === 'category' 
        ? profile.interestCategories 
        : profile.geographicFocus;
    
    const values = currentValue ? currentValue.split(', ').filter(Boolean) : [];
    if (!values.includes(tag)) {
      values.push(tag);
      const newValue = values.join(', ');
      
      if (type === 'concern') {
        updateProfile({ climateConcerns: newValue });
      } else if (type === 'category') {
        updateProfile({ interestCategories: newValue });
      } else {
        updateProfile({ geographicFocus: newValue });
      }
      
      toast({
        title: "Added to Profile",
        description: `"${tag}" has been added to your profile preferences.`,
      });
    } else {
      toast({
        title: "Already in Profile",
        description: `"${tag}" is already in your profile preferences.`,
      });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Column: Header + Toggle + Collapsible Sidebar */}
      <div className="hidden md:flex flex-col shrink-0 border-r border-border">
        {/* Fixed Header - always visible */}
        <div
          className="h-12 flex items-center px-3 border-b border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors w-56"
          onClick={handleNewAnalysis}
          title="New Analysis"
        >
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Climate News</span>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="font-heading text-sm font-semibold text-foreground">Translator</span>
        </div>

        {/* Toggle button - always visible, outside sidebar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-8 mx-2 mt-2 justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-mono text-2xs uppercase tracking-wider">History</span>
        </Button>

        {/* Sidebar - collapsible content */}
        <aside
          className={cn(
            "flex-1 shrink-0 transition-all duration-200 ease-in-out overflow-hidden",
            sidebarOpen ? "opacity-100" : "opacity-0 h-0"
          )}
        >
          <ArticleHistorySidebar
            history={history}
            selectedId={selectedHistoryId}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            onAddTagToProfile={handleAddTagToProfile}
          />
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="shrink-0 border-b border-border bg-background">
          <div className="flex h-12 items-center justify-end px-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Profile</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Profile Warning */}
            {!isProfileComplete && (
              <div className="flex items-center gap-3 p-3 border border-warning/30 bg-warning/5 text-sm animate-fade-in">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <p className="text-foreground flex-1 text-xs">
                  Configure your profile for personalized analysis
                </p>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                    Configure
                  </Button>
                </Link>
              </div>
            )}

            {/* Article Input */}
            <Card variant="elevated" className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle>Article Analysis</CardTitle>
                </div>
                <CardDescription>
                  Paste climate news content for evidence-based analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Paste article text here..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  rows={3}
                  className="resize-y min-h-[80px] text-sm font-body"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !articleContent.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results or News Feed */}
            {analysis ? (
              <AnalysisResults analysis={analysis} />
            ) : (
              <NewsFeed onPasteArticle={handlePasteFromNews} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border bg-background px-4 py-2">
          <p className="text-2xs text-muted-foreground font-mono text-center">
            Powered by Kith AI • Evidence-based climate intelligence
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;