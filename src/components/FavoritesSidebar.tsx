import { Star, FileText, Tag, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { FavoriteTag } from "@/hooks/useFavorites";
import { AnalysisResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FavoritesSidebarProps {
  favorites: ArticleHistoryItem[];
  favoriteTags: FavoriteTag[];
  selectedId: string | null;
  onSelect: (item: ArticleHistoryItem) => void;
  onRemoveFavorite: (id: string) => void;
  onRemoveTag: (label: string, type: string) => void;
  onAddTagToFavorites: (tag: FavoriteTag) => void;
  onSearchByTag: (tag: string) => void;
  isTagFavorite: (label: string, type: string) => boolean;
}

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

export function FavoritesSidebar({
  favorites,
  favoriteTags,
  selectedId,
  onSelect,
  onRemoveFavorite,
  onRemoveTag,
  onAddTagToFavorites,
  onSearchByTag,
  isTagFavorite,
}: FavoritesSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="h-12 flex items-center px-3 border-b border-border">
        <Star className="h-4 w-4 text-primary mr-2" />
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Favorites</span>
      </div>

      <Tabs defaultValue="articles" className="flex-1 flex flex-col overflow-hidden">
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
                      className={cn(
                        "group flex flex-col gap-1.5 p-2 cursor-pointer transition-colors border-l-2 overflow-hidden",
                        selectedId === item.id
                          ? "bg-primary/5 border-l-primary text-foreground"
                          : "hover:bg-muted/50 border-l-transparent text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => onSelect(item)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(item.id);
                          }}
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
                                      onAddTagToFavorites(tag);
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
                                      onSearchByTag(tag.label);
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
                      onClick={() => onSearchByTag(tag.label)}
                    >
                      {tag.label}
                    </Badge>
                    <span className="text-2xs text-muted-foreground capitalize">{tag.type}</span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveTag(tag.label, tag.type)}
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
    </div>
  );
}
