import { Star, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { cn } from "@/lib/utils";

interface FavoritesSidebarProps {
  favorites: ArticleHistoryItem[];
  selectedId: string | null;
  onSelect: (item: ArticleHistoryItem) => void;
  onRemoveFavorite: (id: string) => void;
}

export function FavoritesSidebar({
  favorites,
  selectedId,
  onSelect,
  onRemoveFavorite,
}: FavoritesSidebarProps) {
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
    <div className="flex h-full flex-col bg-background border-r border-border">
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
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
