import { useEffect, useRef } from "react";
import { Network } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { GraphData } from "@/types/api";

interface GraphCanvasProps {
  graph: GraphData;
}

export function GraphCanvas({ graph }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !graph.nodes.length) {
      return;
    }

    let cy: import("cytoscape").Core | undefined;
    let cancelled = false;

    void import("cytoscape").then(({ default: cytoscape }) => {
      if (cancelled || !containerRef.current) {
        return;
      }

      cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...graph.nodes.map((node) => ({ data: node })),
          ...graph.edges.map((edge) => ({ data: edge })),
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#65736d",
              color: "#17201c",
              label: "data(label)",
              "font-size": 11,
              "text-wrap": "wrap",
              "text-max-width": "110px",
              "text-valign": "bottom",
              "text-margin-y": 8,
              width: 34,
              height: 34,
            },
          },
          {
            selector: 'node[type = "Species"]',
            style: {
              "background-color": "#247255",
              shape: "round-rectangle",
              width: 44,
              height: 30,
              color: "#17201c",
              "font-weight": 700,
            },
          },
          {
            selector: 'node[focus = "true"]',
            style: {
              "background-color": "#c07845",
              "border-color": "#75411f",
              "border-width": 3,
            },
          },
          {
            selector: 'node[type = "Category"]',
            style: {
              "background-color": "#7767a8",
            },
          },
          {
            selector: "edge",
            style: {
              width: 1.4,
              "line-color": "#bac5bf",
              "target-arrow-color": "#bac5bf",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": 9,
              color: "#65736d",
              "text-rotation": "autorotate",
            },
          },
        ],
        layout: {
          name: "cose",
          animate: false,
          padding: 40,
          nodeRepulsion: 8000,
          idealEdgeLength: 95,
        },
      });
    });

    return () => {
      cancelled = true;
      cy?.destroy();
    };
  }, [graph]);

  if (!graph.nodes.length) {
    return (
      <Empty className="border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Network />
          </EmptyMedia>
          <EmptyTitle>Graph belum memiliki node</EmptyTitle>
          <EmptyDescription>
            Pilih spesies lain atau pastikan SPARQL endpoint berisi data.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="p-0">
      <div
        className="h-[min(70vh,680px)] min-h-[480px] w-full"
        ref={containerRef}
      />
    </Card>
  );
}
