import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface QueryPanelProps {
  query: string;
  compact?: boolean;
}

export function QueryPanel({ query, compact = false }: QueryPanelProps) {
  if (!query) {
    return null;
  }

  return (
    <Card className={compact ? "bg-foreground text-background" : undefined}>
      <CardContent>
        <Accordion collapsible type="single">
          <AccordionItem className="border-0" value="sparql-query">
            <AccordionTrigger className={compact ? "hover:text-background" : undefined}>
              SPARQL query
            </AccordionTrigger>
            <AccordionContent>
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-foreground p-4 text-xs leading-5 text-background">
                <code>{query}</code>
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
