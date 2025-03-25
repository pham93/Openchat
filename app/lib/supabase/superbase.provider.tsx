import { useRevalidator } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { tryCatch } from "~/utils/tryCatch";

const SupabaseContext = createContext<{ supabase?: SupabaseClient }>({});

export const useSupabaseClient = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("No available SupabaseClientProvider");
  }
  return context.supabase;
};

export const SupabaseClientProvider = ({
  children,
  url,
  anonKey,
}: PropsWithChildren & { url: string; anonKey: string }) => {
  const supabase = useMemo(
    () => createBrowserClient(url, anonKey),
    [url, anonKey]
  );

  const revalidator = useRevalidator();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      console.debug("Revalidate due to auth state changes");
      revalidator.revalidate();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
