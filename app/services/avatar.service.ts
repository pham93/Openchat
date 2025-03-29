import { getSupabaseServerClient } from "~/lib/supabase/supabase.server";

export async function getAvatars(
  request: Request,
  userId: string,
  headers = new Headers()
) {
  return getSupabaseServerClient(request, headers)
    .from("avatar")
    .select("*")
    .eq("user_id", userId);
}

export async function getAvatar(request: Request, id: string) {
  return getSupabaseServerClient(request)
    .from("avatar")
    .select("*")
    .eq("id", id)
    .single();
}
