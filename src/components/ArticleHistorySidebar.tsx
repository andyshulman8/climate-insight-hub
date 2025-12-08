import { FileText, Trash2, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ArticleHistorySidebarProps {
  history: ArticleHistoryItem[];
  selectedId: string | null;
  onSelect: (item: ArticleHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onAddTagToProfile: (tag: string, type: 'concern' | 'category' | 'geographic') => void;
}

const extractTags = (analysis: ArticleHistoryItem['analysis']) => {
  const tags: { label: string; type: 'concern' | 'category' | 'geographic' }[] = [];
  
  // Extract from risk assessment
  if (analysis.risk_assessment?.risk_level) {
    tags.push({ label: analysis.risk_assessment.risk_level, type: 'concern' });
  }
  
  // Extract from sentiment
  if (analysis.sentiment_analysis?.tone) {
    tags.push({ label: analysis.sentiment_analysis.tone, type: 'category' });
  }
  
  // Extract key terms as potential tags
  if (analysis.key_terms_explained) {
    Object.keys(analysis.key_terms_explained).slice(0, 2).forEach(term => {
      tags.push({ label: term, type: 'category' });
    });
  }
  
  return tags;
};

export function ArticleHistorySidebar({
  history,
  selectedId,
  onSelect,
  onDelete,
  onClear,
  onAddTagToProfile,
}: ArticleHistorySidebarProps) {
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

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Clear All button */}
      {history.length > 0 && (
        <div className="px-2 py-1 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="w-full h-6 text-2xs text-muted-foreground hover:text-destructive justify-start gap-1.5"
          >
            <Trash2 className="h-3 w-3" />
            Clear All
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {history.length === 0 ? (
            <div className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">No analyses yet</p>
            </div>
          ) : (
            history.map((item) => {
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
                        onDelete(item.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
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
                              className="text-2xs py-0 px-1.5 h-4 cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tag.label}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-1" align="start">
                            <div className="flex flex-col gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 justify-start text-xs gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddTagToProfile(tag.label, tag.type);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                Add to Profile
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 justify-start text-xs gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // This could trigger a search/filter in the future
                                  onAddTagToProfile(tag.label, tag.type);
                                }}
                              >
                                <Search className="h-3 w-3" />
                                Show More Like This
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
    </div>
  );
}
