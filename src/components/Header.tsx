import { Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
interface HeaderProps {
  onSettingsClick: () => void;
}
export function Header({
  onSettingsClick
}: HeaderProps) {
  return <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Climate News Translator
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by Kith AI
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onSettingsClick} aria-label="Open settings">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>;
}