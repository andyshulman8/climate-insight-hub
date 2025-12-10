import { useState } from "react";
import { Link } from "react-router-dom";
import { User, FileText, Loader2, ChevronRight, ChevronLeft, GripVertical, Star, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleHistorySidebar } from "@/components/ArticleHistorySidebar";
import { FavoritesSidebar } from "@/components/FavoritesSidebar";
import { AnalysisResults } from "@/components/AnalysisResults";
import { NewsFeed } from "@/components/NewsFeed";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Index = () => {
  const { profile, updateProfile, isProfileComplete } = useUserProfile();
  const { history, addArticle, removeArticle, clearHistory } = useArticleHistory();
  const { favorites, addFavorite, removeFavorite, isFavorite, favoriteTags, addFavoriteTag, removeFavoriteTag, isTagFavorite } = useFavorites();
  
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      setAnalysis(null); // Clear analysis to show news feed with filter
      setMobileSheetOpen(false);
      toast({ 
        title: "Filtering articles",
        description: `Showing articles with "${tag}"`
      });
    } else if (action === 'interest') {
      // Add to interests (interestCategories) in profile
      const currentValue = profile.interestCategories || "";
      const values = currentValue ? currentValue.split(', ').filter(Boolean) : [];
      if (!values.includes(tag)) {
        values.push(tag);
        updateProfile({ interestCategories: values.join(', ') });
        // Also add to favorite tags
        if (!isTagFavorite(tag, 'category')) {
          addFavoriteTag({ label: tag, type: 'category' });
        }
        toast({
          title: "Added to interests",
          description: `"${tag}" added to your interests and favorite tags.`,
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

  // Mobile sidebar content
  const MobileSidebarContent = () => (
    <Tabs defaultValue="history" className="flex-1 flex flex-col h-full">
      <TabsList className="mx-2 mt-2 grid w-auto grid-cols-2">
        <TabsTrigger value="history" className="text-xs gap-1">
          <History className="h-3 w-3" />
          History
        </TabsTrigger>
        <TabsTrigger value="favorites" className="text-xs gap-1">
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
      {/* Desktop: Resizable sidebar */}
      <ResizablePanelGroup direction="horizontal" className="hidden md:flex">
        {/* Left Panel: Header + Toggle + Collapsible Sidebar */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={35}
          collapsible
          collapsedSize={0}
          onCollapse={() => setSidebarOpen(false)}
          onExpand={() => setSidebarOpen(true)}
          className={cn(
            "flex flex-col shrink-0 border-r border-border transition-all",
            !sidebarOpen && "hidden"
          )}
        >
          {/* Fixed Header - always visible */}
          <div
            className="h-12 flex items-center px-3 border-b border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors"
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
            <ChevronLeft className="h-4 w-4" />
            <span className="font-mono text-2xs uppercase tracking-wider">History</span>
          </Button>

          {/* Sidebar content */}
          <aside className="flex-1 overflow-hidden">
            <ArticleHistorySidebar
              history={history}
              selectedId={selectedHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
              onTagAction={handleTagAction}
            />
          </aside>
        </ResizablePanel>

        {/* Resize Handle */}
        {sidebarOpen && (
          <ResizableHandle withHandle className="bg-border hover:bg-primary/20 transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </ResizableHandle>
        )}

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={80} minSize={50}>
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Header */}
            <header className="shrink-0 border-b border-border bg-background">
              <div className="flex h-12 items-center justify-between px-4">
                {/* Show expand button when sidebar is closed */}
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-mono text-2xs uppercase tracking-wider">History</span>
                  </Button>
                )}
                {sidebarOpen && <div />}
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
                    >
                      <Star className={cn("h-3.5 w-3.5", selectedHistoryId && isFavorite(selectedHistoryId) && "fill-primary text-primary")} />
                      <span className="text-xs">{selectedHistoryId && isFavorite(selectedHistoryId) ? "Unfavorite" : "Favorite"}</span>
                    </Button>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-xs">Profile</span>
                    </Button>
                  </Link>
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

                {analysis ? (
                  <AnalysisResults analysis={analysis} articleContent={articleContent} />
                ) : (
                  <NewsFeed 
                    onPasteArticle={handlePasteFromNews} 
                    tagFilter={tagFilter}
                    onClearFilter={handleClearTagFilter}
                    onTagAction={handleTagAction}
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
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile: Simple layout with sheet for history/favorites */}
      <div className="flex flex-col w-full md:hidden">
        <header className="shrink-0 border-b border-border bg-background">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <MobileSidebarContent />
                </SheetContent>
              </Sheet>
              <span className="font-heading text-sm font-semibold text-foreground">Climate News Translator</span>
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
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
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
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
