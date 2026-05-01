import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Central Fretes RS — Frete e Mudança em Canoas Porto Alegre Litoral e todo o RS" },
      { name: "description", content: "Solicite seu frete ou mudança em segundos. Atendemos Canoas, Porto Alegre, litoral e interior do RS. Orçamento grátis pelo WhatsApp!" },
      { name: "keywords", content: "frete Canoas, mudança Canoas, frete Porto Alegre, mudança Porto Alegre, frete litoral RS, frete interior RS, fretes compartilhados RS, mudança residencial RS, frete barato RS" },
      { name: "author", content: "Central Fretes RS" },
      { name: "robots", content: "index, follow" },
      { name: "geo.region", content: "BR-RS" },
      { name: "geo.placename", content: "Canoas" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Central Fretes RS" },
      { property: "og:title", content: "Central Fretes RS — Frete e Mudança em Canoas Porto Alegre Litoral e todo o RS" },
      { property: "og:description", content: "Solicite seu frete ou mudança em segundos. Atendemos Canoas, Porto Alegre, litoral e interior do RS. Orçamento grátis pelo WhatsApp!" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/df3e2b78-6cc3-4358-9367-f6c04199de3e/id-preview-aa76b88e--5b3f2874-021f-4cfd-b5cf-49715aa1a212.lovable.app-1777505699788.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Central Fretes RS — Frete e Mudança em Canoas, POA e todo o RS" },
      { name: "twitter:description", content: "Solicite seu frete ou mudança em segundos. Orçamento grátis pelo WhatsApp!" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/df3e2b78-6cc3-4358-9367-f6c04199de3e/id-preview-aa76b88e--5b3f2874-021f-4cfd-b5cf-49715aa1a212.lovable.app-1777505699788.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: "https://centraldefretesrs.lovable.app/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
  return (
    <>
      <Outlet />
      <Toaster theme="dark" position="top-right" richColors />
    </>
  );
}
