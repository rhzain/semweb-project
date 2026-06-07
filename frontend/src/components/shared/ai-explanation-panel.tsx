import { useMemo } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AIExplanation } from "@/types/api";

interface AIExplanationPanelProps {
  explanation: AIExplanation | null;
  isLoading?: boolean;
  className?: string;
}

type MarkdownPart =
  | { type: "text"; content: string }
  | { type: "table"; header: string[]; rows: string[][] };

function normalizeLooseMarkdownTables(markdown: string) {
  return markdown.replace(/\|\s+\|/g, "|\n|");
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isDividerRow(cells: string[]) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitMarkdownParts(markdown: string): MarkdownPart[] {
  const lines = normalizeLooseMarkdownTables(markdown).split(/\r?\n/);
  const parts: MarkdownPart[] = [];
  const textBuffer: string[] = [];

  function flushText() {
    const content = textBuffer.join("\n").trim();
    if (content) {
      parts.push({ type: "text", content });
    }
    textBuffer.length = 0;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1];

    if (
      isTableRow(line) &&
      nextLine &&
      isTableRow(nextLine) &&
      isDividerRow(splitTableRow(nextLine))
    ) {
      flushText();

      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && isTableRow(lines[index])) {
        const cells = splitTableRow(lines[index]);
        if (!isDividerRow(cells)) {
          rows.push(cells);
        }
        index += 1;
      }

      parts.push({ type: "table", header, rows });
      index -= 1;
    } else {
      textBuffer.push(line);
    }
  }

  flushText();
  return parts;
}

function MarkdownTable({
  header,
  rows,
}: {
  header: string[];
  rows: string[][];
}) {
  return (
    <div className="not-prose my-4 overflow-hidden rounded-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            {header.map((cell, index) => (
              <TableHead className="font-semibold" key={`${cell}-${index}`}>
                <MarkdownInline>{cell}</MarkdownInline>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {header.map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <MarkdownInline>{row[cellIndex] || ""}</MarkdownInline>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MarkdownInline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children: linkChildren, ...props }) => (
          <a
            className="font-medium text-primary underline underline-offset-2"
            rel="noreferrer"
            target="_blank"
            {...props}
          >
            {linkChildren}
          </a>
        ),
        code: ({ children: codeChildren, ...props }) => (
          <code
            className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]"
            {...props}
          >
            {codeChildren}
          </code>
        ),
        em: ({ children: emChildren, ...props }) => (
          <em className="italic" {...props}>
            {emChildren}
          </em>
        ),
        p: ({ children: paragraphChildren }) => <span>{paragraphChildren}</span>,
        strong: ({ children: strongChildren, ...props }) => (
          <strong className="font-semibold text-foreground" {...props}>
            {strongChildren}
          </strong>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export function AIExplanationPanel({
  explanation,
  isLoading,
  className,
}: AIExplanationPanelProps) {
  const markdownParts = useMemo(
    () => splitMarkdownParts(explanation?.answer || ""),
    [explanation?.answer],
  );

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
          {markdownParts.map((part, index) =>
            part.type === "table" ? (
              <MarkdownTable
                header={part.header}
                key={index}
                rows={part.rows}
              />
            ) : (
              <ReactMarkdown key={index}>{part.content}</ReactMarkdown>
            ),
          )}
        </div>
        {explanation.error ? (
          <p className="text-destructive mt-2 text-xs">Catatan: {explanation.error}</p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
