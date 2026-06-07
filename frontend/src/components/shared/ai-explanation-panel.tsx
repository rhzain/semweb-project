import { AlertCircle, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AIExplanation } from "@/types/api";

interface AIExplanationPanelProps {
  explanation: AIExplanation | null;
}

export function AIExplanationPanel({
  explanation,
}: AIExplanationPanelProps) {
  if (!explanation) {
    return null;
  }

  if (!explanation.answer) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>AI belum menghasilkan penjelasan</AlertTitle>
        <AlertDescription>
          {explanation.error || "Silakan coba kembali beberapa saat lagi."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Sparkles />
      <AlertTitle>AI Explanation Assistant</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p className="whitespace-pre-wrap text-foreground">{explanation.answer}</p>
        <p>
          Gemini hanya menerima konteks hasil SPARQL. Data utama tetap berasal
          dari RDF, ontologi, dan SPARQL endpoint.
        </p>
        {explanation.error ? (
          <p className="text-destructive">Catatan: {explanation.error}</p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
