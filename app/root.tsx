import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { config } from "./utils/config";
import { SupabaseClientProvider } from "./lib/supabase/superbase.provider";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "/cover.jgp", as: "image" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader() {
  return {
    env: {
      SUPABASE_URL: config.SUPABASE_URL,
      SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { env } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <SupabaseClientProvider
          url={env.SUPABASE_URL}
          anonKey={env.SUPABASE_ANON_KEY}
        >
          {children}
        </SupabaseClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
