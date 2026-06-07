import { Database, GitCompare, Network, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Cari", icon: Search },
  { to: "/data", label: "Semua Data", icon: Database },
  { to: "/graph", label: "Graph", icon: Network },
  { to: "/compare", label: "Bandingkan", icon: GitCompare },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="flex w-fit items-center gap-3" to="/">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            KG
          </span>
          <span className="flex flex-col">
            <strong className="font-heading text-sm font-semibold tracking-tight sm:text-base">
              Flora Fauna Lexicon
            </strong>
            <small className="text-xs text-muted-foreground">
              RDF &middot; Ontology &middot; SPARQL
            </small>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="flex max-w-full gap-1 overflow-x-auto pb-1 lg:pb-0"
        >
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "shrink-0",
                )
              }
              end={to === "/"}
              key={to}
              to={to}
            >
              <Icon data-icon="inline-start" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
