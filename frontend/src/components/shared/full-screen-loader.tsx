import { LoaderCircle } from "lucide-react";

interface FullScreenLoaderProps {
  label?: string;
}

export function FullScreenLoader({
  label = "Memuat data...",
}: FullScreenLoaderProps) {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background"
      role="status"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle className="size-7 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
