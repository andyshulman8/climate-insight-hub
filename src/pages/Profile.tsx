import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, User, MapPin, Layers, MessageCircle, Loader2, HelpCircle, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchableSelect } from "@/components/SearchableSelect";
import { profileSetup, type ProfileSetupVariables, ApiError } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFavorites } from "@/hooks/useFavorites";
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

export default function Profile() {
  const { profile, updateProfile, addToHistory } = useUserProfile();
  const { favorites, removeFavorite } = useFavorites();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Favorites Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border shrink-0">
        <div className="h-12 flex items-center px-3 border-b border-border">
          <Star className="h-4 w-4 text-primary mr-2" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Favorites</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {favorites.length === 0 ? (
              <div className="p-4 text-center">
                <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No favorites yet</p>
              </div>
            ) : (
              favorites.map((item) => (
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
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
          <div className="flex h-12 items-center gap-3 px-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Climate Translator</span>
              <span className="text-muted-foreground">→</span>
              <h1 className="font-heading text-sm font-semibold text-foreground">Profile</h1>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-6">
        <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
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