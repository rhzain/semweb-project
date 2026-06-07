import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InfoCardProps {
  title: string;
  rows: Array<[string, string]>;
}

export function InfoCard({ title, rows }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col">
          {rows.map(([label, value], index) => (
            <div key={label}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm leading-6">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
