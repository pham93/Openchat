import { useRevalidator } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Database } from "supabase/database.types";

const SupabaseContext = createContext<{
  supabase?: SupabaseClient<Database>;
}>({});

export const useSupabaseClient = () => {
  const context = useContext(SupabaseContext);
  if (!context?.supabase) {
    throw new Error("No available SupabaseClientProvider");
  }
  return { supabase: context.supabase };
};

export const SupabaseClientProvider = ({
  children,
  url,
  anonKey,
}: PropsWithChildren & { url: string; anonKey: string }) => {
  const supabase = useMemo(
    () => createBrowserClient<Database>(url, anonKey),
    [url, anonKey]
  );

  const revalidator = useRevalidator();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((e, session) => {
      if (e === "SIGNED_IN") {
        sessionStorage.setItem("user_id", `${session?.user.id}`);
        return;
      }
      if (e === "SIGNED_OUT") {
        sessionStorage.removeItem("user_id");
      }

      if (e === "INITIAL_SESSION") {
        return;
      }

      console.debug("Revalidate due to auth state changes");
      revalidator.revalidate();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
