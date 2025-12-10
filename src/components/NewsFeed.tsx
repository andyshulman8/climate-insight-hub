import { useState, useEffect, useMemo } from "react";
import { Copy, ExternalLink, RefreshCw, Newspaper, X, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
}

interface NewsFeedProps {
  onPasteArticle: (text: string) => void;
  tagFilter?: string | null;
  onClearFilter?: () => void;
  onTagAction?: (tag: string, action: 'search' | 'interest') => void;
}

// Extract tags from article content
const extractArticleTags = (title: string, description: string): string[] => {
  const text = `${title} ${description}`.toLowerCase();
  const tagKeywords: { [key: string]: string[] } = {
    'renewable energy': ['renewable', 'solar', 'wind', 'clean energy'],
    'climate policy': ['policy', 'regulation', 'legislation', 'government', 'eu', 'un'],
    'emissions': ['emissions', 'carbon', 'co2', 'greenhouse'],
    'biodiversity': ['biodiversity', 'species', 'wildlife', 'ecosystem'],
    'extreme weather': ['flood', 'drought', 'hurricane', 'wildfire', 'storm'],
    'sea level': ['sea level', 'ocean', 'coastal', 'ice', 'glacier', 'antarctic'],
    'technology': ['technology', 'innovation', 'capture', 'breakthrough'],
    'migration': ['migration', 'displacement', 'refugee'],
    'sustainability': ['sustainable', 'sustainability', 'green'],
  };
  
  const foundTags: string[] = [];
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      foundTags.push(tag);
    }
  }
  return foundTags.slice(0, 3);
};

export function NewsFeed({ onPasteArticle, tagFilter, onClearFilter, onTagAction }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);

  const fetchNews = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using NewsData.io free API for climate/sustainability news with page param
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=pub_63aborO0iX0Qko0i7UHj8dVHNpLJr&q=climate%20OR%20sustainability%20OR%20environment&language=en&category=environment&size=5&page=${page}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const formattedArticles: NewsArticle[] = data.results.map((item: any) => ({
          title: item.title || "Untitled",
          description: item.description || item.content || "No description available",
          url: item.link || "#",
          source: item.source_name || item.source_id || "Unknown",
          publishedAt: item.pubDate || new Date().toISOString(),
          tags: extractArticleTags(item.title || "", item.description || item.content || ""),
        }));
        setArticles(formattedArticles);
      } else {
        // Fallback to sample articles if API fails
        setArticles(getSampleArticles());
      }
    } catch (err) {
      console.error("News fetch error:", err);
      // Use sample articles as fallback
      setArticles(getSampleArticles());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    fetchNews(nextPage);
  };

  useEffect(() => {
    fetchNews(1);
  }, []);

  const getSampleArticles = (): NewsArticle[] => [
    {
      title: "Global renewable energy capacity hits record high in 2024",
      description: "Solar and wind power installations surge worldwide as costs continue to fall, making clean energy more accessible than ever before.",
      url: "https://www.irena.org/",
      source: "IRENA",
      publishedAt: new Date().toISOString(),
      tags: ["renewable energy", "sustainability"],
    },
    {
      title: "New study reveals accelerating ice loss in Antarctica",
      description: "Research published in Nature Climate Change shows Antarctic ice sheets losing mass at unprecedented rates, with implications for global sea levels.",
      url: "https://www.nature.com/nclimate/",
      source: "Nature",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ["sea level", "climate policy"],
    },
    {
      title: "Carbon capture technology breakthrough announced",
      description: "Scientists develop more efficient method for removing CO2 from atmosphere, potentially revolutionizing climate mitigation efforts.",
      url: "https://www.science.org/",
      source: "Science",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      tags: ["technology", "emissions"],
    },
    {
      title: "EU announces ambitious new emissions reduction targets",
      description: "European Union commits to 55% emissions reduction by 2030, with comprehensive policy framework to support green transition.",
      url: "https://ec.europa.eu/clima/",
      source: "EU Commission",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      tags: ["climate policy", "emissions"],
    },
    {
      title: "Climate-driven migration reaches new levels globally",
      description: "UNHCR reports unprecedented displacement due to climate-related disasters, calling for stronger international response.",
      url: "https://www.unhcr.org/",
      source: "UNHCR",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      tags: ["migration", "extreme weather"],
    },
  ];

  // Filter articles by tag if filter is set
  const filteredArticles = useMemo(() => {
    if (!tagFilter) return articles;
    return articles.filter(article => 
      article.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
    );
  }, [articles, tagFilter]);

  const copyHeadline = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: "Copied",
        description: "Headline copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <Card variant="section" className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <CardTitle>Latest Climate News</CardTitle>
          </div>
          <CardDescription>Loading sustainability articles...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-3 border border-border">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="section" className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <CardTitle>Latest Climate News</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleRefresh}
            disabled={isLoading}
            title="Load new articles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          {tagFilter ? (
            <span className="flex items-center gap-2">
              Filtering by: 
              <Badge variant="secondary" className="gap-1">
                {tagFilter}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={onClearFilter}
                />
              </Badge>
            </span>
          ) : (
            "Select an article to analyze or paste your own content above"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {filteredArticles.length === 0 && tagFilter ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No articles match "{tagFilter}". Try a different tag or clear the filter.
          </div>
        ) : null}
        {filteredArticles.map((article, index) => (
          <div
            key={index}
            className="group p-3 border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
              {/* Tags row */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.map((tag, idx) => (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="text-2xs py-0 px-1.5 h-4 cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                          {tag}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem 
                          className="text-xs gap-2 cursor-pointer"
                          onClick={() => onTagAction?.(tag, 'search')}
                        >
                          <Search className="h-3 w-3" />
                          Search similar articles
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs gap-2 cursor-pointer"
                          onClick={() => onTagAction?.(tag, 'interest')}
                        >
                          <Plus className="h-3 w-3" />
                          Add to my interests
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="citation-badge">{article.source}</span>
                    <span className="text-2xs text-muted-foreground font-mono">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyHeadline(article.title)}
                    title="Copy headline"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                    title="Open article"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
