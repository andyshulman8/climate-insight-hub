import { FileText, Trash2, Clock, Plus } from "lucide-react";
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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-3 border-b border-border">
        <Button onClick={onNewAnalysis} className="w-full justify-start gap-2" variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs">New Analysis</span>
        </Button>
      </div>

      <div className="px-3 py-2 border-b border-border">
        <span className="font-mono text-2xs text-muted-foreground uppercase tracking-wider">History</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {history.length === 0 ? (
            <div className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">No analyses yet</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-start gap-2 p-2 cursor-pointer transition-colors border-l-2",
                  selectedId === item.id
                    ? "bg-primary/5 border-l-primary text-foreground"
                    : "hover:bg-muted/50 border-l-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onSelect(item)}
              >
                <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">{item.title}</p>
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}