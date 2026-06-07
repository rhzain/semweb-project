import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface StatusLineProps {
  loading: boolean;
  error?: string;
  count: number;
  label?: string;
}

export function StatusLine({
  loading,
  error,
  count,
  label = "entri",
}: StatusLineProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-6 items-center">
        {loading ? (
          <Badge variant="secondary">
            <Spinner data-icon="inline-start" />
            Memuat data
          </Badge>
        ) : (
          <Badge variant="outline">
            {count} {label}
          </Badge>
        )}
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>SPARQL tidak dapat dimuat</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
