import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/data", label: "Katalog Spesies", matches: ["/data", "/species/"] },
  { to: "/compare", label: "Bandingkan", matches: ["/compare"] },
  { to: "/graph", label: "Knowledge Graph", matches: ["/graph"] },
];

export function AppHeader() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto grid min-h-18 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          className="w-fit font-heading text-xl font-bold tracking-[-0.04em] text-primary sm:text-2xl"
          to="/"
        >
          WikiFF
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="col-span-2 row-start-2 flex max-w-full justify-start gap-6 overflow-x-auto pb-3 text-sm sm:gap-8 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center lg:pb-0"
        >
          {navigationItems.map(({ to, label, matches }) => {
            const isActive = matches.some((path) =>
              path.endsWith("/") ? pathname.startsWith(path) : pathname === path,
            );

            return (
              <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative shrink-0 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive &&
                  "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
              )}
              key={to}
              to={to}
            >
              {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block" />
      </div>
    </header>
  );
}
