import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { Database } from "supabase/database.types";
import { config } from "~/utils/config";

export const getSupabaseServerClient = (
  request: Request,
  responseHeaders: Headers = new Headers()
) => {
  return createServerClient<Database>(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeaders = request.headers.get("Cookie") ?? "";
          return parseCookieHeader(cookieHeaders) as {
            name: string;
            value: string;
          }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHeaders.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );
};
