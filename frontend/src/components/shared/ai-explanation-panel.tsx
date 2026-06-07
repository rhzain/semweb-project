import { AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { AIExplanation } from "@/types/api";

interface AIExplanationPanelProps {
  explanation: AIExplanation | null;
  isLoading?: boolean;
  className?: string;
}

export function AIExplanationPanel({
  explanation,
  isLoading,
  className,
}: AIExplanationPanelProps) {
  if (isLoading) {
    return (
      <Alert className={cn("border bg-card", className)}>
        <Sparkles className="animate-pulse text-muted-foreground" />
        <AlertTitle className="animate-pulse text-muted-foreground">Menyiapkan penjelasan AI...</AlertTitle>
        <AlertDescription className="mt-4 flex flex-col gap-3">
           <div className="space-y-2">
             <div className="h-4 w-full animate-pulse rounded bg-muted" />
             <div className="h-4 w-[90%] animate-pulse rounded bg-muted" />
             <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
             <div className="h-4 w-[95%] animate-pulse rounded bg-muted" />
           </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!explanation) {
    return null;
  }

  if (!explanation.answer) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle />
        <AlertTitle>AI belum menghasilkan penjelasan</AlertTitle>
        <AlertDescription>
          {explanation.error || "Silakan coba kembali beberapa saat lagi."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn("border bg-card", className)}>
      <Sparkles />
      <AlertTitle>Penjelasan AI</AlertTitle>
      <AlertDescription className="mt-4 flex flex-col gap-3">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
          <ReactMarkdown>{explanation.answer}</ReactMarkdown>
        </div>
        {explanation.error ? (
          <p className="text-destructive mt-2 text-xs">Catatan: {explanation.error}</p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
