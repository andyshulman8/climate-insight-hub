import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, User, MapPin, Layers, MessageCircle, Loader2, HelpCircle, Star, FileText, Tag, Search, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchableSelect } from "@/components/SearchableSelect";
import { profileSetup, type ProfileSetupVariables, ApiError, AnalysisResponse } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFavorites, FavoriteTag } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  climateConcernOptions,
  geographicFocusOptions,
  interestCategoryOptions,
  valuesToString,
  stringToValues,
} from "@/lib/profileOptions";

const extractTags = (analysis: AnalysisResponse) => {
  const tags: { label: string; type: 'concern' | 'category' | 'geographic' }[] = [];
  
  if (analysis.risk_assessment?.risk_level) {
    tags.push({ label: analysis.risk_assessment.risk_level, type: 'concern' });
  }
  
  if (analysis.sentiment_analysis?.tone) {
    tags.push({ label: analysis.sentiment_analysis.tone, type: 'category' });
  }
  
  if (analysis.key_terms_explained) {
    Object.keys(analysis.key_terms_explained).slice(0, 2).forEach(term => {
      tags.push({ label: term, type: 'category' });
    });
  }
  
  return tags;
};

export default function Profile() {
  const { profile, updateProfile, addToHistory } = useUserProfile();
  const { favorites, removeFavorite, favoriteTags, addFavoriteTag, removeFavoriteTag, isTagFavorite } = useFavorites();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const concernValues = stringToValues(profile.climateConcerns, climateConcernOptions);
  const geoValues = stringToValues(profile.geographicFocus, geographicFocusOptions);
  const categoryValues = stringToValues(profile.interestCategories, interestCategoryOptions);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setResponse(null);

    const variables: ProfileSetupVariables = {
      user_input: userInput,
      climate_concerns: profile.climateConcerns || "general climate change",
      geographic_focus: profile.geographicFocus || "global",
      interest_categories: profile.interestCategories || "all",
      conversation_history: profile.conversationHistory.join("\n") || "Starting conversation",
    };

    try {
      const result = await profileSetup(variables, profile.sessionId);

      if (result.success) {
        setResponse(result.response);
        addToHistory(`User: ${userInput}`);
        addToHistory(`Assistant: ${result.response}`);
      } else {
        throw new Error(result.error || "Unknown error occurred");
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
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to get response",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setUserInput("");
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
    toast({ 
      title: "Searching for articles",
      description: `Finding articles with "${tag}"...`
    });
  };

  // Favorites sidebar content (shared between desktop and mobile)
  const FavoritesContent = () => (
    <Tabs defaultValue="articles" className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-12 flex items-center px-3 border-b border-border">
        <Star className="h-4 w-4 text-primary mr-2" />
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Favorites</span>
      </div>
      <TabsList className="mx-2 mt-2 grid w-auto grid-cols-2">
        <TabsTrigger value="articles" className="text-xs gap-1">
          <FileText className="h-3 w-3" />
          Articles
        </TabsTrigger>
        <TabsTrigger value="tags" className="text-xs gap-1">
          <Tag className="h-3 w-3" />
          Tags
        </TabsTrigger>
      </TabsList>

      <TabsContent value="articles" className="flex-1 overflow-hidden m-0 mt-2">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-0.5">
            {favorites.length === 0 ? (
              <div className="p-4 text-center">
                <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No favorites yet</p>
              </div>
            ) : (
              favorites.map((item) => {
                const tags = extractTags(item.analysis);
                
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col gap-1.5 p-2 transition-colors border-l-2 border-l-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground overflow-hidden"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs font-medium truncate leading-tight max-w-full">{item.title}</p>
                        <p className="text-2xs text-muted-foreground font-mono mt-0.5">{formatDate(item.timestamp)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => removeFavorite(item.id)}
                        title="Remove from favorites"
                      >
                        <Star className="h-3 w-3 fill-primary text-primary" />
                      </Button>
                    </div>
                    
                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-5">
                        {tags.map((tag, idx) => (
                          <Popover key={idx}>
                            <PopoverTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-2xs py-0 px-1.5 h-4 cursor-pointer hover:bg-primary/10 transition-colors",
                                  isTagFavorite(tag.label, tag.type) && "bg-primary/10 border-primary/30"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tag.label}
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-1" align="start">
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 justify-start text-xs gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddTagToFavorites(tag);
                                  }}
                                >
                                  <Star className={cn("h-3 w-3", isTagFavorite(tag.label, tag.type) && "fill-primary text-primary")} />
                                  {isTagFavorite(tag.label, tag.type) ? "In Favorites" : "Add to Favorites"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 justify-start text-xs gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSearchByTag(tag.label);
                                  }}
                                >
                                  <Search className="h-3 w-3" />
                                  Search Articles
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="tags" className="flex-1 overflow-hidden m-0 mt-2">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {favoriteTags.length === 0 ? (
              <div className="p-4 text-center">
                <Tag className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No favorite tags yet</p>
                <p className="text-2xs text-muted-foreground mt-1">Click tags in articles to add them</p>
              </div>
            ) : (
              favoriteTags.map((tag, idx) => (
                <div
                  key={`${tag.label}-${tag.type}-${idx}`}
                  className="group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="text-xs py-0.5 px-2 cursor-pointer hover:bg-primary/10"
                    onClick={() => handleSearchByTag(tag.label)}
                  >
                    {tag.label}
                  </Badge>
                  <span className="text-2xs text-muted-foreground capitalize">{tag.type}</span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFavoriteTag(tag.label, tag.type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop: Favorites Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border shrink-0">
        <FavoritesContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
          <div className="flex h-12 items-center gap-3 px-4">
            {/* Mobile: Sheet trigger */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <FavoritesContent />
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Climate Translator</span>
              <span className="text-muted-foreground">→</span>
              <h1 className="font-heading text-sm font-semibold text-foreground">Profile</h1>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-6">
        <div className="mx-auto max-w-lg space-y-6 animate-fade-in px-4">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle>Analysis Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure your interests for personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-medium">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Climate Concerns
                </Label>
                <SearchableSelect
                  options={climateConcernOptions}
                  value={concernValues}
                  onChange={(values) =>
                    updateProfile({ climateConcerns: valuesToString(values, climateConcernOptions) })
                  }
                  placeholder="Select concerns..."
                  searchPlaceholder="Search..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Geographic Focus
                </Label>
                <SearchableSelect
                  options={geographicFocusOptions}
                  value={geoValues}
                  onChange={(values) =>
                    updateProfile({ geographicFocus: valuesToString(values, geographicFocusOptions) })
                  }
                  placeholder="Select regions..."
                  searchPlaceholder="Search..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-medium">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  Interest Categories
                </Label>
                <SearchableSelect
                  options={interestCategoryOptions}
                  value={categoryValues}
                  onChange={(values) =>
                    updateProfile({ interestCategories: valuesToString(values, interestCategoryOptions) })
                  }
                  placeholder="Select categories..."
                  searchPlaceholder="Search..."
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Need Suggestions?</CardTitle>
              </div>
              <CardDescription>
                Ask the AI for profile recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                  placeholder="e.g., 'What should I track if I live near the coast?'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Ask
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <Card variant="highlight" className="animate-slide-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose-swiss text-sm">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
