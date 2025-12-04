import { useState } from "react";
import { Send, User, MapPin, Layers, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileSetup, type ProfileSetupVariables, ApiError } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export function ProfileSetup() {
  const { profile, updateProfile, addToHistory } = useUserProfile();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

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
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Your Climate Profile
          </CardTitle>
          <CardDescription>
            Set your preferences to get personalized climate news analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="concerns" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                Climate Concerns
              </Label>
              <Input
                id="concerns"
                type="search"
                placeholder="e.g., sea level rise, wildfires"
                value={profile.climateConcerns}
                onChange={(e) => updateProfile({ climateConcerns: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geographic" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Geographic Focus
              </Label>
              <Input
                id="geographic"
                placeholder="e.g., local, coastal, Arctic"
                value={profile.geographicFocus}
                onChange={(e) => updateProfile({ geographicFocus: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categories" className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Interest Categories
              </Label>
              <Input
                id="categories"
                placeholder="e.g., energy, policy, science"
                value={profile.interestCategories}
                onChange={(e) => updateProfile({ interestCategories: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="highlight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            Chat with Climate Analyzer
          </CardTitle>
          <CardDescription>
            Ask questions to refine your profile and get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your climate interests, ask for recommendations, or request more details..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={isLoading || !userInput.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card variant="glass" className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose-climate">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.conversationHistory.length > 0 && (
        <Card variant="outline" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {profile.conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-sm ${
                    msg.startsWith("User:")
                      ? "bg-primary/10 text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="prose-climate [&>p]:mb-0">
                    <ReactMarkdown>{msg}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
