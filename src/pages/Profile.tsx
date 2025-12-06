import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, User, MapPin, Layers, MessageCircle, Loader2, ArrowLeft, Lightbulb } from "lucide-react";
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

  // Convert stored string values to arrays for the select components
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
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Your Climate Profile
            </h1>
            <p className="text-xs text-muted-foreground">
              Customize your news analysis preferences
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Select your interests to get personalized climate news analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  Climate Concerns
                </Label>
                <SearchableSelect
                  options={climateConcernOptions}
                  value={concernValues}
                  onChange={(values) =>
                    updateProfile({ climateConcerns: valuesToString(values, climateConcernOptions) })
                  }
                  placeholder="Select your climate concerns..."
                  searchPlaceholder="Search concerns..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Geographic Focus
                </Label>
                <SearchableSelect
                  options={geographicFocusOptions}
                  value={geoValues}
                  onChange={(values) =>
                    updateProfile({ geographicFocus: valuesToString(values, geographicFocusOptions) })
                  }
                  placeholder="Select geographic areas..."
                  searchPlaceholder="Search regions..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Interest Categories
                </Label>
                <SearchableSelect
                  options={interestCategoryOptions}
                  value={categoryValues}
                  onChange={(values) =>
                    updateProfile({ interestCategories: valuesToString(values, interestCategoryOptions) })
                  }
                  placeholder="Select interest categories..."
                  searchPlaceholder="Search categories..."
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber" />
                Need Help Setting Up?
              </CardTitle>
              <CardDescription>
                Ask the AI for suggestions on how to fill out your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="e.g., 'What concerns should I track if I live near the coast?' or 'Help me discover relevant topics'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Ask for Suggestions
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <Card variant="glass" className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-lg">AI Suggestions</CardTitle>
                <CardDescription>
                  Here's how to fill out your profile based on your question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose-climate">
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
