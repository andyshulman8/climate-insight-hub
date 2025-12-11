import { useState, useEffect, useMemo } from "react";
import { Copy, ExternalLink, RefreshCw, Newspaper, X, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  isTagFavorite?: (tag: string) => boolean;
}

const ARTICLE_TAGS = [
  "renewable energy",
  "climate policy",
  "emissions",
  "biodiversity",
  "extreme weather",
  "sea level",
  "technology",
  "migration",
  "sustainability",
];

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

export function NewsFeed({ onPasteArticle, tagFilter, onClearFilter, onTagAction, isTagFavorite }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

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
    {
      title: "Major cities pledge net-zero emissions by 2040",
      description: "Coalition of 100 cities commits to accelerated climate action, representing over 200 million residents worldwide.",
      url: "https://www.c40.org/",
      source: "C40 Cities",
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      tags: ["climate policy", "sustainability"],
    },
    {
      title: "Ocean acidification threatens marine ecosystems",
      description: "New research shows coral reefs and shellfish populations declining faster than predicted due to changing ocean chemistry.",
      url: "https://www.noaa.gov/",
      source: "NOAA",
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
      tags: ["biodiversity", "sea level"],
    },
    {
      title: "Electric vehicle sales surge past expectations",
      description: "Global EV adoption accelerates with sales up 40% year-over-year, driven by new models and improved charging infrastructure.",
      url: "https://www.iea.org/",
      source: "IEA",
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      tags: ["technology", "emissions"],
    },
  ];

  const fetchNews = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const sortedArticles = getSampleArticles().sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    setArticles(sortedArticles);
    setLastRefreshTime(Date.now());
    setIsLoading(false);
  };

  const handleRefresh = () => {
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    if (timeSinceLastRefresh < 5000) {
      toast({
        title: "No new articles",
        description: "Check back in a moment for updates",
      });
      return;
    }
    fetchNews();
    toast({ title: "Articles refreshed" });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (tagFilter) {
      setSelectedTagFilter(tagFilter);
    }
  }, [tagFilter]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    
    if (selectedTagFilter && selectedTagFilter !== "all") {
      result = result.filter(article => 
        article.tags.some(tag => tag.toLowerCase().includes(selectedTagFilter.toLowerCase()))
      );
    }
    
    if (keywordSearch.trim()) {
      const query = keywordSearch.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [articles, selectedTagFilter, keywordSearch]);

  const copyHeadline = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: "Copied",
        description: "Headline copied to clipboard",
      });
    } catch {
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

  const clearFilters = () => {
    setKeywordSearch("");
    setSelectedTagFilter("all");
    onClearFilter?.();
  };

  const hasActiveFilters = keywordSearch.trim() || (selectedTagFilter && selectedTagFilter !== "all");

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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <CardTitle>Latest Climate News</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh articles"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          Select an article to analyze or paste your own content above
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by keyword..."
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="h-8 pl-8 pr-8 text-xs"
              data-testid="input-keyword-search"
            />
            {keywordSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-8 w-8"
                onClick={() => setKeywordSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-tag-filter">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All tags</SelectItem>
              {ARTICLE_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag} className="text-xs">{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs px-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <CardContent className="space-y-2 pt-0">
        {filteredArticles.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No articles match your search. Try different keywords or clear filters.
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <div
              key={index}
              className="group p-3 border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors"
              data-testid={`card-article-${index}`}
            >
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.map((tag, idx) => (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={`text-2xs py-0 px-1.5 h-4 cursor-pointer hover:bg-primary/10 transition-colors ${
                            isTagFavorite?.(tag) ? 'bg-primary/10 border-primary/30' : ''
                          }`}
                          data-testid={`badge-tag-${tag}`}
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
                    data-testid={`button-copy-${index}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                    title="Open article"
                    data-testid={`button-open-${index}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
