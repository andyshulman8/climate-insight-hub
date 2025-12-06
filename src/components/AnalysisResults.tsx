import {
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Heart,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResponse } from "@/lib/api";

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getRiskBadgeVariant = (level: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (level.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getToneBadgeVariant = (tone: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (tone.toLowerCase()) {
      case "positive":
        return "default";
      case "negative":
        return "destructive";
      case "balanced":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Plain Language Summary */}
      <Card variant="highlight" className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-accent" />
            Plain Language Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed text-lg">
            {analysis.plain_language_summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Points & Relevance */}
      <Card variant="elevated" className="animate-slide-up delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber" />
            Personalized Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Key Points</h4>
            <ul className="space-y-2">
              {Array.isArray(analysis.personalized_highlights?.key_points) &&
                analysis.personalized_highlights.key_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{point}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-2 text-foreground">Why This Is Relevant to You</h4>
            <p className="text-muted-foreground">
              {analysis.personalized_highlights?.relevance_explanation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card variant="glass" className="animate-slide-up delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber" />
            Risk Assessment
            {analysis.risk_assessment?.risk_level && (
              <Badge variant={getRiskBadgeVariant(analysis.risk_assessment.risk_level)}>
                {analysis.risk_assessment.risk_level}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80">{analysis.risk_assessment?.explanation}</p>
        </CardContent>
      </Card>

      {/* Why This Matters */}
      <Card variant="elevated" className="animate-slide-up delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Why This Matters to You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80">{analysis.why_this_matters_to_you}</p>
        </CardContent>
      </Card>

      {/* Key Terms */}
      {analysis.key_terms_explained &&
        Object.keys(analysis.key_terms_explained).length > 0 && (
          <Card variant="outline" className="animate-slide-up delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-info" />
                Key Terms Explained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {Object.entries(analysis.key_terms_explained).map(([term, definition]) => (
                  <div key={term} className="flex flex-col sm:flex-row sm:gap-2">
                    <dt className="font-semibold text-foreground">{term}:</dt>
                    <dd className="text-muted-foreground">{definition}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

      {/* Sentiment Analysis */}
      {analysis.sentiment_analysis && (
        <Card variant="glass" className="animate-slide-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sentiment Analysis
              {analysis.sentiment_analysis.tone && (
                <Badge variant={getToneBadgeVariant(analysis.sentiment_analysis.tone)}>
                  {analysis.sentiment_analysis.tone}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80">{analysis.sentiment_analysis.emotional_impact}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
