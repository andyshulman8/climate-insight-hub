import {
  AlertTriangle,
  Check,
  Info,
  BookOpen,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResponse } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getRiskStyles = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "medium":
        return "bg-warning/10 text-warning-foreground border-warning/30";
      case "low":
        return "bg-success/10 text-success border-success/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Section */}
      <Card variant="highlight">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle>Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">
            {analysis.plain_language_summary}
          </p>
        </CardContent>
      </Card>

      {/* Risk Assessment - Compact */}
      {analysis.risk_assessment?.risk_level && (
        <div className={`flex items-center gap-3 p-3 border text-sm ${getRiskStyles(analysis.risk_assessment.risk_level)}`}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs uppercase tracking-wider">Risk Level: </span>
            <span className="font-semibold">{analysis.risk_assessment.risk_level}</span>
          </div>
        </div>
      )}

      {/* Key Points */}
      <Card variant="default">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-success" />
            <CardTitle>Key Findings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Array.isArray(analysis.personalized_highlights?.key_points) &&
              analysis.personalized_highlights.key_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      {/* Deep Dive Accordion */}
      <Accordion type="single" collapsible className="space-y-1">
        {/* Relevance */}
        <AccordionItem value="relevance" className="border px-3">
          <AccordionTrigger className="text-sm py-2.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Why This Matters to You</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground pb-3">
            {analysis.why_this_matters_to_you}
          </AccordionContent>
        </AccordionItem>

        {/* Risk Details */}
        {analysis.risk_assessment?.explanation && (
          <AccordionItem value="risk" className="border px-3">
            <AccordionTrigger className="text-sm py-2.5 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                <span className="font-medium">Risk Assessment Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              {analysis.risk_assessment.explanation}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Key Terms */}
        {analysis.key_terms_explained &&
          Object.keys(analysis.key_terms_explained).length > 0 && (
            <AccordionItem value="terms" className="border px-3">
              <AccordionTrigger className="text-sm py-2.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-info" />
                  <span className="font-medium">Key Terms</span>
                  <Badge variant="secondary" className="ml-1 text-2xs h-4 px-1">
                    {Object.keys(analysis.key_terms_explained).length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <dl className="space-y-2">
                  {Object.entries(analysis.key_terms_explained).map(([term, definition]) => (
                    <div key={term} className="text-sm">
                      <dt className="font-mono text-xs text-foreground font-semibold">{term}</dt>
                      <dd className="text-muted-foreground mt-0.5">{definition}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
          )}

        {/* Sentiment */}
        {analysis.sentiment_analysis && (
          <AccordionItem value="sentiment" className="border px-3">
            <AccordionTrigger className="text-sm py-2.5 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-medium">Sentiment Analysis</span>
                {analysis.sentiment_analysis.tone && (
                  <Badge variant="outline" className="text-2xs h-4 px-1.5">
                    {analysis.sentiment_analysis.tone}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              {analysis.sentiment_analysis.emotional_impact}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Source Citation */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="citation-badge">
          <FileCheck className="h-3 w-3" />
          AI-analyzed
        </span>
        <span className="text-2xs text-muted-foreground font-mono">•</span>
        <span className="text-2xs text-muted-foreground font-mono">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}