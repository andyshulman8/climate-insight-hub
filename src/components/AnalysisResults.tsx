import {
  AlertTriangle,
  Check,
  Info,
  BookOpen,
  ArrowRight,
  FileCheck,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisResponse } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
  articleContent?: string;
}

// Extract potential source URLs from article content
const extractSourceLinks = (content: string): { url: string; title: string }[] => {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const matches = content.match(urlRegex) || [];
  
  return matches.slice(0, 3).map(url => {
    // Try to extract domain as title
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return { url, title: domain };
    } catch {
      return { url, title: url.slice(0, 30) + '...' };
    }
  });
};

// Generate search links based on key terms
const generateSearchLinks = (analysis: AnalysisResponse): { url: string; title: string }[] => {
  const links: { url: string; title: string }[] = [];
  
  // Add search based on key terms
  if (analysis.key_terms_explained) {
    const terms = Object.keys(analysis.key_terms_explained).slice(0, 2);
    terms.forEach(term => {
      links.push({
        url: `https://www.google.com/search?q=${encodeURIComponent(term + ' climate news')}`,
        title: `Search: ${term}`,
      });
    });
  }
  
  // Add a general climate search
  if (analysis.risk_assessment?.risk_level) {
    links.push({
      url: `https://news.google.com/search?q=${encodeURIComponent('climate ' + analysis.risk_assessment.risk_level + ' risk')}`,
      title: 'Related Climate News',
    });
  }
  
  return links.slice(0, 3);
};

export function AnalysisResults({ analysis, articleContent = "" }: AnalysisResultsProps) {
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

  const sourceLinks = extractSourceLinks(articleContent);
  const searchLinks = generateSearchLinks(analysis);
  const allLinks = [...sourceLinks, ...searchLinks].slice(0, 4);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Source Links */}
      {allLinks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 border border-border rounded-sm">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-mono">Sources:</span>
          {allLinks.map((link, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="h-6 text-2xs gap-1 px-2"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            >
              {link.title}
              <ExternalLink className="h-2.5 w-2.5" />
            </Button>
          ))}
        </div>
      )}

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
