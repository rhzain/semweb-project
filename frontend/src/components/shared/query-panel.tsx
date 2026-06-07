import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface QueryPanelProps {
  query: string;
}

export function QueryPanel({ query }: QueryPanelProps) {
  if (!query) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Accordion collapsible type="single">
          <AccordionItem className="border-0" value="sparql-query">
            <AccordionTrigger>SPARQL query</AccordionTrigger>
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
