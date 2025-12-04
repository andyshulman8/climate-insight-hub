import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { ProfileSetup } from "@/components/ProfileSetup";
import { ArticleAnalysis } from "@/components/ArticleAnalysis";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { User, FileSearch, CheckCircle } from "lucide-react";

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isProfileComplete } = useUserProfile();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container py-8">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-8 text-center animate-fade-in">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Understand Climate News, Your Way
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get personalized, accessible analysis of complex climate news based on your
              interests and concerns. Powered by AI to help you stay informed.
            </p>
          </section>

          {/* Main Tabs */}
          <Tabs defaultValue="setup" className="animate-slide-up delay-100">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Setup
                {isProfileComplete && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Analyze Article
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup">
              <ProfileSetup />
            </TabsContent>

            <TabsContent value="analyze">
              <ArticleAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Climate News Translator • Built with{" "}
            <a
              href="https://kith.build"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kith AI
            </a>
          </p>
        </div>
      </footer>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
