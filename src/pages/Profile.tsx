import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, User, MapPin, Layers, MessageCircle, Loader2, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/SearchableSelect";
import { profileSetup, type ProfileSetupVariables, ApiError } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import {
  climateConcernOptions,
  geographicFocusOptions,
  interestCategoryOptions,
  valuesToString,
  stringToValues,
} from "@/lib/profileOptions";

export default function Profile() {
  const { profile, updateProfile, addToHistory } = useUserProfile();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const concernValues = stringToValues(profile.climateConcerns, climateConcernOptions);
  const geoValues = stringToValues(profile.geographicFocus, geographicFocusOptions);
  const categoryValues = stringToValues(profile.interestCategories, interestCategoryOptions);

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="flex h-12 items-center gap-3 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Profile</span>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-heading text-sm font-semibold text-foreground">
              Preferences
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
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
  );
}