import { useState } from "react";
import { User, FileText, Loader2, ChevronRight, ChevronLeft, Star, History, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleHistorySidebar } from "@/components/ArticleHistorySidebar";
import { FavoritesSidebar } from "@/components/FavoritesSidebar";
import { AnalysisResults } from "@/components/AnalysisResults";
import { NewsFeed } from "@/components/NewsFeed";
import { RightPanel } from "@/components/RightPanel";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useArticleHistory, ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { useFavorites, FavoriteTag } from "@/hooks/useFavorites";
import {
  articleAnalysis,
  normalizeResponseField,
  type AnalysisResponse,
  ApiError,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Index = () => {
  const { profile, updateProfile, addToHistory, isProfileComplete } = useUserProfile();
  const { history, addArticle, removeArticle, clearHistory } = useArticleHistory();
  const { favorites, addFavorite, removeFavorite, isFavorite, favoriteTags, addFavoriteTag, removeFavoriteTag, isTagFavorite } = useFavorites();
  
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

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
    setMobileSheetOpen(false);
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

  const handleTagAction = (tag: string, action: 'search' | 'interest') => {
    if (action === 'search') {
      setTagFilter(tag);
      setAnalysis(null);
      setMobileSheetOpen(false);
      toast({ 
        title: "Filtering articles",
        description: `Showing articles with "${tag}"`
      });
    } else if (action === 'interest') {
      const currentValue = profile.interestCategories || "";
      const values = currentValue ? currentValue.split(', ').filter(Boolean) : [];
      if (!values.includes(tag)) {
        values.push(tag);
        updateProfile({ interestCategories: values.join(', ') });
        if (!isTagFavorite(tag, 'category')) {
          addFavoriteTag({ label: tag, type: 'category' });
        }
        toast({
          title: "Added to interests",
          description: `"${tag}" added to your interests.`,
        });
      } else {
        toast({
          title: "Already in interests",
          description: `"${tag}" is already in your interests.`,
        });
      }
    }
  };

  const handleAddTagToFavorites = (tag: FavoriteTag) => {
    if (isTagFavorite(tag.label, tag.type)) {
      toast({ title: "Tag already in favorites" });
    } else {
      addFavoriteTag(tag);
      toast({ title: "Tag added to favorites" });
    }
  };

  const handleSearchByTag = (tag: string) => {
    handleTagAction(tag, 'search');
  };

  const handleClearTagFilter = () => {
    setTagFilter(null);
  };

  const isArticleTagFavorite = (tag: string) => {
    return isTagFavorite(tag, 'category');
  };

  const handleRemoveInterestTag = (tag: string) => {
    removeFavoriteTag(tag, 'category');
    const currentValue = profile.interestCategories || "";
    const values = currentValue.split(', ').filter(Boolean).filter(v => v !== tag);
    updateProfile({ interestCategories: values.join(', ') });
    toast({ title: "Tag removed from interests" });
  };

  const LeftPanelContent = () => (
    <Tabs defaultValue="history" className="flex-1 flex flex-col h-full">
      <TabsList className="mx-2 mt-2 grid w-auto grid-cols-2">
        <TabsTrigger value="history" className="text-xs gap-1" data-testid="tab-history">
          <History className="h-3 w-3" />
          History
        </TabsTrigger>
        <TabsTrigger value="favorites" className="text-xs gap-1" data-testid="tab-favorites">
          <Star className="h-3 w-3" />
          Favorites
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="flex-1 overflow-hidden m-0">
        <ArticleHistorySidebar
          history={history}
          selectedId={selectedHistoryId}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClear={handleClearHistory}
          onTagAction={handleTagAction}
        />
      </TabsContent>

      <TabsContent value="favorites" className="flex-1 overflow-hidden m-0">
        <FavoritesSidebar
          favorites={favorites}
          favoriteTags={favoriteTags}
          selectedId={selectedHistoryId}
          onSelect={handleSelectHistory}
          onRemoveFavorite={removeFavorite}
          onRemoveTag={removeFavoriteTag}
          onAddTagToFavorites={handleAddTagToFavorites}
          onSearchByTag={handleSearchByTag}
          isTagFavorite={isTagFavorite}
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full">
        {/* Left Panel - History/Favorites */}
        <div className="relative flex">
          <div
            className={cn(
              "flex flex-col border-r border-border bg-background transition-all duration-200",
              leftPanelOpen ? "w-64" : "w-0 overflow-hidden"
            )}
          >
            {/* Header */}
            <div
              className="h-12 flex items-center px-3 border-b border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors shrink-0"
              onClick={handleNewAnalysis}
              title="New Analysis"
            >
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Climate News</span>
              <span className="text-muted-foreground mx-2">/</span>
              <span className="font-heading text-sm font-semibold text-foreground">Translator</span>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              <LeftPanelContent />
            </div>
          </div>

          {/* Toggle button - external tab */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-5 flex items-center justify-center bg-muted border border-border border-l-0 rounded-r-md hover:bg-accent transition-colors"
            title={leftPanelOpen ? "Hide history" : "Show history"}
            data-testid="button-toggle-left-panel"
          >
            {leftPanelOpen ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="shrink-0 border-b border-border bg-background">
            <div className="flex h-12 items-center justify-between px-4 gap-2">
              <div className="flex items-center gap-2">
                {!leftPanelOpen && (
                  <span className="font-heading text-sm font-semibold text-foreground">Climate News Translator</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedHistoryId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const item = history.find(h => h.id === selectedHistoryId);
                      if (item) {
                        if (isFavorite(item.id)) {
                          removeFavorite(item.id);
                          toast({ title: "Removed from favorites" });
                        } else {
                          addFavorite(item);
                          toast({ title: "Added to favorites" });
                        }
                      }
                    }}
                    data-testid="button-toggle-favorite"
                  >
                    <Star className={cn("h-3.5 w-3.5", selectedHistoryId && isFavorite(selectedHistoryId) && "fill-primary text-primary")} />
                    <span className="text-xs">{selectedHistoryId && isFavorite(selectedHistoryId) ? "Unfavorite" : "Favorite"}</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  data-testid="button-toggle-right-panel"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="text-xs">Preferences</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                    data-testid="textarea-article"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !articleContent.trim()}
                    className="w-full sm:w-auto"
                    data-testid="button-analyze"
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

              {analysis ? (
                <AnalysisResults analysis={analysis} articleContent={articleContent} />
              ) : (
                <NewsFeed 
                  onPasteArticle={handlePasteFromNews} 
                  tagFilter={tagFilter}
                  onClearFilter={handleClearTagFilter}
                  onTagAction={handleTagAction}
                  isTagFavorite={isArticleTagFavorite}
                />
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

        {/* Right Panel - Preferences */}
        <div
          className={cn(
            "flex flex-col border-l border-border bg-background transition-all duration-200",
            rightPanelOpen ? "w-80" : "w-0 overflow-hidden"
          )}
        >
          <div className="h-12 flex items-center px-3 border-b border-border shrink-0">
            <User className="h-4 w-4 text-primary mr-2" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Preferences</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <RightPanel
              profile={profile}
              updateProfile={updateProfile}
              addToHistory={addToHistory}
              favoriteTags={favoriteTags}
              addFavoriteTag={addFavoriteTag}
              removeFavoriteTag={removeFavoriteTag}
              isTagFavorite={isTagFavorite}
              onSearchByTag={handleSearchByTag}
              onRemoveInterestTag={handleRemoveInterestTag}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col w-full md:hidden">
        <header className="shrink-0 border-b border-border bg-background">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-mobile-menu">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <LeftPanelContent />
                </SheetContent>
              </Sheet>
              <span className="font-heading text-sm font-semibold text-foreground">Climate News</span>
            </div>
            <div className="flex items-center gap-1">
              {selectedHistoryId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const item = history.find(h => h.id === selectedHistoryId);
                    if (item) {
                      if (isFavorite(item.id)) {
                        removeFavorite(item.id);
                        toast({ title: "Removed from favorites" });
                      } else {
                        addFavorite(item);
                        toast({ title: "Added to favorites" });
                      }
                    }
                  }}
                >
                  <Star className={cn("h-4 w-4", selectedHistoryId && isFavorite(selectedHistoryId) && "fill-primary text-primary")} />
                </Button>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="h-12 flex items-center px-3 border-b border-border">
                    <User className="h-4 w-4 text-primary mr-2" />
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Preferences</span>
                  </div>
                  <RightPanel
                    profile={profile}
                    updateProfile={updateProfile}
                    addToHistory={addToHistory}
                    favoriteTags={favoriteTags}
                    addFavoriteTag={addFavoriteTag}
                    removeFavoriteTag={removeFavoriteTag}
                    isTagFavorite={isTagFavorite}
                    onSearchByTag={handleSearchByTag}
                    onRemoveInterestTag={handleRemoveInterestTag}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <Card variant="elevated" className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle>Article Analysis</CardTitle>
                </div>
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
                  className="w-full"
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
            {analysis ? (
              <AnalysisResults analysis={analysis} articleContent={articleContent} />
            ) : (
              <NewsFeed 
                onPasteArticle={handlePasteFromNews}
                tagFilter={tagFilter}
                onClearFilter={handleClearTagFilter}
                onTagAction={handleTagAction}
                isTagFavorite={isArticleTagFavorite}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
