import { useState } from "react";
import { User, MapPin, Layers, MessageCircle, Loader2, HelpCircle, Send, Heart, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchableSelect } from "@/components/SearchableSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { profileSetup, type ProfileSetupVariables, ApiError } from "@/lib/api";
import { FavoriteTag } from "@/hooks/useFavorites";
import { UserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { climateConcernOptions, interestCategoryOptions, valuesToString, stringToValues } from "@/lib/profileOptions";
const ARTICLE_TAGS = ["renewable energy", "climate policy", "emissions", "biodiversity", "extreme weather", "sea level", "technology", "migration", "sustainability"];
interface RightPanelProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addToHistory: (message: string) => void;
  favoriteTags: FavoriteTag[];
  addFavoriteTag: (tag: FavoriteTag) => void;
  removeFavoriteTag: (label: string, type: string) => void;
  isTagFavorite: (label: string, type: string) => boolean;
  onSearchByTag: (tag: string) => void;
  onRemoveInterestTag: (tag: string) => void;
}
export function RightPanel({
  profile,
  updateProfile,
  addToHistory,
  favoriteTags,
  addFavoriteTag,
  removeFavoriteTag,
  isTagFavorite,
  onSearchByTag,
  onRemoveInterestTag
}: RightPanelProps) {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const concernValues = stringToValues(profile.climateConcerns || "", climateConcernOptions);
  const categoryValues = stringToValues(profile.interestCategories || "", interestCategoryOptions);
  const myInterests = favoriteTags.filter(t => t.type === 'category');
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
      conversation_history: profile.conversationHistory.join("\n") || "Starting conversation"
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
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to get response",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };
  const handleAddTag = (tag: string) => {
    if (!isTagFavorite(tag, 'category')) {
      addFavoriteTag({
        label: tag,
        type: 'category'
      });
      toast({
        title: "Tag added to interests"
      });
    }
  };
  const availableTags = ARTICLE_TAGS.filter(tag => !isTagFavorite(tag, 'category'));

  const generatePersonalAnalysis = () => {
    const concerns = profile.climateConcerns || 'general climate impacts';
    const focus = profile.geographicFocus || 'your region';
    const interests = profile.interestCategories || 'your interests';

    return `Based on your focus on ${focus} and interests in ${interests}, ${concerns} may affect the areas you care about. Short-term impacts could include increased disruption to local services and projects related to ${interests}. Practical actions you can take include supporting local resilience efforts, engaging with community and policy initiatives, and prioritizing low-carbon options in your projects or work. Remember: systemic change is required — individual action helps but isn't the whole solution.`;
  };
  return <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Analysis Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-xs font-medium">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                Geographic Focus
              </Label>
              <Input value={profile.geographicFocus} onChange={e => updateProfile({
              geographicFocus: e.target.value
            })} placeholder="e.g., California coast..." className="text-xs h-8" />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="flex items-center gap-2 text-xs font-medium">
                <Layers className="h-3 w-3 text-muted-foreground" />
                Sentiment Analysis
              </Label>
              <div className="grid grid-cols-1 gap-2">
                <RadioGroup value={profile.sentimentPreference || 'basic'} onValueChange={(v) => updateProfile({ sentimentPreference: v })} className="flex flex-col">
                  <label className="flex items-start gap-2">
                    <RadioGroupItem value="basic" />
                    <div className="text-xs">
                      <div className="font-medium">Basic</div>
                      <div className="text-2xs text-muted-foreground">Simple polarity (positive/neutral/negative) for quick scanning.</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2">
                    <RadioGroupItem value="lexicon" />
                    <div className="text-xs">
                      <div className="font-medium">Lexicon</div>
                      <div className="text-2xs text-muted-foreground">Rule-based tone analysis tuned for climate vocabulary.</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2">
                    <RadioGroupItem value="ml" />
                    <div className="text-xs">
                      <div className="font-medium">Advanced</div>
                      <div className="text-2xs text-muted-foreground">Model-based sentiment with emotional impact and nuance.</div>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>
            
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">My Interest Tags</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Click to search or remove from interests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myInterests.length > 0 ? <div className="flex flex-wrap gap-1.5">
                {myInterests.map((tag, idx) => <DropdownMenu key={`${tag.label}-${idx}`}>
                    <DropdownMenuTrigger asChild>
                      <Badge variant="secondary" className="text-xs py-0.5 px-2 cursor-pointer" data-testid={`badge-interest-${tag.label}`}>
                        {tag.label}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => onSearchByTag(tag.label)}>
                        <Search className="h-3 w-3" />
                        Search articles with this tag
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-destructive" onClick={() => onRemoveInterestTag(tag.label)}>
                        <X className="h-3 w-3" />
                        Remove from interests
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>)}
              </div> : <p className="text-xs text-muted-foreground">No interest tags yet</p>}

            {availableTags.length > 0 && <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Add tags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => <Badge key={tag} variant="outline" className="text-xs py-0.5 px-2 cursor-pointer hover:bg-primary/10" onClick={() => handleAddTag(tag)} data-testid={`badge-add-${tag}`}>
                      + {tag}
                    </Badge>)}
                </div>
              </div>}
          </CardContent>
        </Card>

        

        {response && <Card variant="highlight" className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose-swiss text-xs">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>}

        <Card variant="section">
          <CardHeader>
            <CardTitle className="text-sm">How climate may affect you</CardTitle>
            <CardDescription className="text-xs">A brief, supportive overview tailored to your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs">{generatePersonalAnalysis()}</p>
            <p className="text-2xs text-muted-foreground mt-2">Tip: connect with community organizations and policy efforts — broader action drives most change, and you're not alone in this.</p>
          </CardContent>
        </Card>

        <Card variant="section">
          <CardHeader>
            <CardTitle className="text-sm">Climate Job Boards</CardTitle>
            <CardDescription className="text-xs">Opportunities and hiring in climate and sustainability</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li><a href="https://climatebase.org" target="_blank" rel="noopener noreferrer" className="underline">Climatebase</a></li>
              <li><a href="https://greenjobs.com" target="_blank" rel="noopener noreferrer" className="underline">Green Jobs</a></li>
              <li><a href="https://www.environmentalcareer.com" target="_blank" rel="noopener noreferrer" className="underline">EnvironmentalCareer</a></li>
              <li><a href="https://www.renewableenergyjobs.com" target="_blank" rel="noopener noreferrer" className="underline">RenewableEnergyJobs</a></li>
            </ul>
          </CardContent>
        </Card>

        
      </div>
    </ScrollArea>;
}