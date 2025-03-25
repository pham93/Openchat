import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSupabaseServerClient } from "~/lib/supabase/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();

  await getSupabaseServerClient(request, headers).auth.signOut();
  return redirect("/auth/login", { headers });
}

export default function LogoutPage() {}
