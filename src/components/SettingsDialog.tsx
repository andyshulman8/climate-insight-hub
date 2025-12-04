import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { profile, clearProfile } = useUserProfile();

  const handleClearData = () => {
    clearProfile();
    toast({
      title: "Data Cleared",
      description: "Your profile and conversation history have been reset",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your Climate News Translator preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Current Profile</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Concerns:</span>{" "}
                {profile.climateConcerns || "Not set"}
              </p>
              <p>
                <span className="font-medium">Geographic Focus:</span>{" "}
                {profile.geographicFocus || "Not set"}
              </p>
              <p>
                <span className="font-medium">Categories:</span>{" "}
                {profile.interestCategories || "Not set"}
              </p>
              <p>
                <span className="font-medium">Messages in History:</span>{" "}
                {profile.conversationHistory.length}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will reset your profile and clear conversation history
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
