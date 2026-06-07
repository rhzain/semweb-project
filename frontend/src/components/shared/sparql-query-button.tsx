import { useState } from "react";
import { Check, Code2, Copy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SparqlQueryButtonProps {
  query: string;
  className?: string;
}

export function SparqlQueryButton({ query, className }: SparqlQueryButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!query) return null;

  // Trim to remove leading/trailing extra blank lines, and add exactly 1 empty line at the bottom
  const lines = [...query.trim().split("\n"), ""];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(query);
    } catch {
      const el = document.createElement("textarea");
      el.value = query;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("gap-1.5 rounded-sm text-xs", className)} size="sm" variant="outline">
          <Code2 className="size-3.5" />
          SPARQL Query
        </Button>
      </DialogTrigger>

      {/* showCloseButton=false — we render our own X aligned with Copy */}
      <DialogContent
        className="w-[90vw] max-w-[90vw] gap-0 rounded-sm p-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between border-b px-5 py-3">
          <DialogTitle className="text-sm font-semibold">SPARQL Query</DialogTitle>

          {/* Actions: Copy + Close in one row */}
          <div className="flex items-center gap-2">
            <Button
              className="h-7 gap-1.5 rounded-sm px-2.5 text-xs"
              onClick={handleCopy}
              size="sm"
              type="button"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Salin kode
                </>
              )}
            </Button>

            <DialogClose asChild>
              <Button
                className="h-7 w-7 rounded-sm p-0"
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="size-3.5" />
                <span className="sr-only">Tutup</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Code editor */}
        <div className="max-h-[calc(85vh-52px)] overflow-y-auto overflow-x-hidden bg-[#1e1e2e]">
          <div className="flex min-h-full">
            {/* Line numbers */}
            <div
              aria-hidden="true"
              className="select-none shrink-0 border-r border-white/10 bg-[#181825] px-3 py-4 text-right font-mono text-xs leading-5 text-white/30"
            >
              {lines.map((_, i) => (
                <div key={i} className="h-5">{i + 1}</div>
              ))}
            </div>

            {/* Code */}
            <div className="flex-1 overflow-x-auto">
              <pre className="inline-block min-w-full px-5 py-4 font-mono text-xs leading-5 whitespace-pre text-[#cdd6f4]">
                <code>
                  {lines.map((line, i) => (
                    <div key={i} className="h-5">
                      {line || " "}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
