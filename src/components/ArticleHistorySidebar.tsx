import { FileText, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { cn } from "@/lib/utils";

interface ArticleHistorySidebarProps {
  history: ArticleHistoryItem[];
  selectedId: string | null;
  onSelect: (item: ArticleHistoryItem) => void;
  onDelete: (id: string) => void;
  onNewAnalysis: () => void;
}

export function ArticleHistorySidebar({
  history,
  selectedId,
  onSelect,
  onDelete,
  onNewAnalysis,
}: ArticleHistorySidebarProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col border-r border-border/50 bg-card/50">
      <div className="p-4 border-b border-border/50">
        <Button onClick={onNewAnalysis} className="w-full" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No articles analyzed yet</p>
              <p className="text-xs mt-1">Your analysis history will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedId === item.id
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onSelect(item)}
              >
                <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs opacity-70">{formatDate(item.timestamp)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
