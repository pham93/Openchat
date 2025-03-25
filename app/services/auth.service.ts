import { redirect } from "@remix-run/node";
import { getSupabaseServerClient } from "~/lib/supabase/supabase.server";
import { IUser, IUserLogin } from "~/types/user.schema";
import { actionResponse } from "~/utils/actionResponse";
import { createLogger } from "~/utils/logger";

const logger = createLogger("AuthService");

export async function signup(request: Request, { email, password }: IUser) {
  const headers = new Headers();
  const url = new URL(request.url);
  const supabase = getSupabaseServerClient(request, headers);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${url.origin}/auth/confirm`,
    },
  });

  if (error) {
    return actionResponse({ error });
  }
  logger.info("[Signup] Successfully signed up");
  return actionResponse({ data: { success: true } });
}

export async function signin(
  request: Request,
  responseHeaders: Headers,
  { email, password }: IUserLogin
) {
  const supabase = getSupabaseServerClient(request, responseHeaders);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data, error };
  }

  if (!data.user?.email_confirmed_at) {
    return { error: new Error("User not yet verified"), data };
  }

  return { data, error };
}

export async function confirmEmail(
  request: Request
): Promise<{ success: boolean; message?: string }> {
  const url = new URL(request.url);
  const headers = new Headers();
  const token = url.searchParams.get("token");
  const type = url.searchParams.get("type");

  if (token && type === "signup") {
    const { data: userData } = await getSupabaseServerClient(
      request,
      headers
    ).auth.verifyOtp({
      token_hash: token,
      type,
    });
    if (userData.session) {
      logger.info("[Signup] Successfully verify user");
      return { success: true };
    }
  }
  return {
    success: false,
    message:
      url.searchParams.get("error_description") ??
      "Error with confirmation link",
  };
}

export async function getUser(request: Request) {
  return await getSupabaseServerClient(request, new Headers()).auth.getUser();
}

export async function authenticationGuard(
  request: Request,
  headers = new Headers()
) {
  logger.debug("Verifying user session");
  // don't use getSession on the server due to cookies can be tampered
  const { data, error } = await getSupabaseServerClient(
    request,
    headers
  ).auth.getUser();

  if (error || !data.user) {
    logger.error("No user session. Redirecting to login page");
    throw redirect("/auth/login");
  }

  return data.user;
}
