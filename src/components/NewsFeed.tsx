import { useState, useEffect, useMemo } from "react";
import { Copy, ExternalLink, RefreshCw, Newspaper, X, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/SearchableSelect";
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

const FEEDS: Record<string, string> = {
  "Denver Post": "https://www.denverpost.com/feed/",
  "NYT": "https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "NWS Grand Junction Alerts": "https://alerts.weather.gov/cap/co.php?x=1",
  "KRDO Colorado News": "https://krdo.com/feed/",
  "Times of Israel": "https://www.timesofisrael.com/feed/",
};

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
  const [tagSelection, setTagSelection] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'relevance'>('recent');
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
    try {
      const apiKey = (import.meta as any).env?.VITE_NEWS_API_KEY;
      const query = "(sustainability OR climate) OR ((sustainability OR climate) AND news)";
      const sortParam = sortBy === 'relevance' ? 'relevancy' : 'publishedAt';
      let fetched: NewsArticle[] = [];

      // Try fetching RSS feeds and parse items
      const fetchRss = async (): Promise<NewsArticle[]> => {
        const results: NewsArticle[] = [];
        await Promise.all(Object.entries(FEEDS).map(async ([sourceName, url]) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const text = await res.text();
            const doc = new DOMParser().parseFromString(text, "application/xml");
            const items = Array.from(doc.querySelectorAll("item, entry"));
            items.slice(0, 8).forEach((it) => {
              const title = (it.querySelector("title")?.textContent || "").trim();
              const link = (it.querySelector("link")?.textContent || it.querySelector("link")?.getAttribute("href") || "").trim();
              const description = (it.querySelector("description")?.textContent || it.querySelector("summary")?.textContent || "").trim();
              const pub = (it.querySelector("pubDate")?.textContent || it.querySelector("updated")?.textContent || new Date().toISOString()).trim();
              if (title && link) {
                results.push({
                  title,
                  description,
                  url: link,
                  source: sourceName,
                  publishedAt: pub,
                  tags: extractArticleTags(title, description),
                });
              }
            });
          } catch (e) {
            // ignore feed errors for now
          }
        }));
        return results;
      };

      if (apiKey) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=20&sortBy=${sortParam}&language=en&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          fetched = (data.articles || []).map((a: any) => ({
            title: a.title || "",
            description: a.description || "",
            url: a.url || "",
            source: a.source?.name || "",
            publishedAt: a.publishedAt || new Date().toISOString(),
            tags: extractArticleTags(a.title || "", a.description || ""),
          } as NewsArticle));
        }
      }

      // Also fetch RSS feeds (best-effort). Merge RSS items with API results.
      const rssItems = await fetchRss();
      // Merge, preferring API results but appending rss items not already present by url
      const urls = new Set(fetched.map(f => f.url));
      rssItems.forEach(r => {
        if (r.url && !urls.has(r.url)) {
          fetched.push(r);
          urls.add(r.url);
        }
      });

      if (fetched.length === 0) {
        // fallback to sample articles when nothing was fetched
        fetched = getSampleArticles();
      }

      const sortedArticles = fetched.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setArticles(sortedArticles);
      setLastRefreshTime(Date.now());
    } catch (err) {
      setArticles(getSampleArticles());
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (keyword: string, sort: 'recent' | 'relevance') => {
    setIsLoading(true);
    try {
      const apiKey = (import.meta as any).env?.VITE_NEWS_API_KEY;
      // Combine user keyword with base climate query
      const base = "(sustainability OR climate) OR ((sustainability OR climate) AND news)";
      const query = `${keyword} AND (${base})`;
      const sortParam = sort === 'relevance' ? 'relevancy' : 'publishedAt';
      let fetched: NewsArticle[] = [];

      if (apiKey) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=30&sortBy=${sortParam}&language=en&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          fetched = (data.articles || []).map((a: any) => ({
            title: a.title || "",
            description: a.description || "",
            url: a.url || "",
            source: a.source?.name || "",
            publishedAt: a.publishedAt || new Date().toISOString(),
            tags: extractArticleTags(a.title || "", a.description || ""),
          } as NewsArticle));
        }
      }

      if (fetched.length === 0) {
        fetched = getSampleArticles().filter(a => {
          const q = keyword.toLowerCase();
          return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
        });
      }

      const sortedArticles = fetched.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setArticles(sortedArticles);
      setLastRefreshTime(Date.now());
    } catch (err) {
      setArticles(getSampleArticles());
    } finally {
      setIsLoading(false);
    }
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
    if (keywordSearch.trim()) {
      performSearch(keywordSearch.trim(), sortBy);
    } else {
      fetchNews();
    }
    toast({ title: "Articles refreshed" });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (keywordSearch.trim()) {
      performSearch(keywordSearch.trim(), sortBy);
    } else {
      fetchNews();
    }
  }, [keywordSearch, sortBy]);

  useEffect(() => {
    if (tagFilter) {
      setSelectedTagFilter(tagFilter);
      setTagSelection(tagFilter === 'all' ? [] : [tagFilter]);
    }
  }, [tagFilter]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    
    const activeTag = tagSelection?.[0] || (selectedTagFilter && selectedTagFilter !== 'all' ? selectedTagFilter : null);
    if (activeTag) {
      result = result.filter(article => 
        article.tags.some(tag => tag.toLowerCase().includes(activeTag.toLowerCase()))
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
          <div className="w-[160px]">
            <SearchableSelect
              options={ARTICLE_TAGS.map(t => ({ value: t, label: t }))}
              value={tagSelection}
              onChange={(vals) => {
                setTagSelection(vals);
                setSelectedTagFilter(vals[0] || 'all');
              }}
              placeholder="Filter by tag"
              searchPlaceholder="Search tags..."
              emptyMessage="No tags"
            />
          </div>
          {keywordSearch.trim() && (
            <div className="w-[120px]">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'recent' | 'relevance')}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent" className="text-xs">Recent</SelectItem>
                  <SelectItem value="relevance" className="text-xs">Relevance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
