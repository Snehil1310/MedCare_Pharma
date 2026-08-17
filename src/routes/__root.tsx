import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { getOpenAlertsCount } from "@/server-fns/alerts";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MedCare Pharma — Supply Chain Control Tower" },
      {
        name: "description",
        content:
          "Autonomous demand sensing, expiry-aware allocation and procure-to-pay for healthcare supply chains.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="grid-glow min-w-0 flex-1">
          <TopBar />
          <main className="px-5 py-6 lg:px-8">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

function TopBar() {
  const { data } = useQuery({
    queryKey: ['alertsCount'],
    queryFn: () => getOpenAlertsCount(),
    refetchInterval: 5000,
  });
  
  const count = data?.c || 0;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex size-2 rounded-full bg-ok" />
        Live control tower · 6 DCs · 1,284 SKUs
      </div>
      <div className="flex items-center gap-2">
        {count > 0 ? (
          <Link 
            to="/alerts" 
            className="rounded-full border border-critical/30 bg-critical/10 px-3 py-1 text-[11px] font-medium text-critical transition-colors hover:bg-critical/20"
          >
            {count} open alert{count !== 1 ? 's' : ''}
          </Link>
        ) : (
          <Link 
            to="/alerts" 
            className="rounded-full border border-ok/30 bg-ok/10 px-3 py-1 text-[11px] font-medium text-ok transition-colors hover:bg-ok/20"
          >
            0 open alerts
          </Link>
        )}
        <span className="rounded-full border border-ai/30 bg-ai/10 px-3 py-1 text-[11px] font-medium text-ai">
          AI autonomy 87%
        </span>
      </div>
    </div>
  );
}

