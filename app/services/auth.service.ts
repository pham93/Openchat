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
      emailRedirectTo: `${url.origin}/confirm`,
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
    return actionResponse({ data, error });
  }

  if (!data.user?.email_confirmed_at || !data.user.email) {
    return { error: new Error("User not yet verified"), data };
  }

  return actionResponse({ data, error });
}

export async function confirmEmail(request: Request) {
  const url = new URL(request.url);
  const headers = new Headers();
  const token = url.searchParams.get("token");
  const type = url.searchParams.get("type");

  if (token && type === "email") {
    const { data: userData, error } = await getSupabaseServerClient(
      request,
      headers
    ).auth.verifyOtp({
      token_hash: token,
      type,
    });

    if (userData.session?.user) {
      logger.info({ user: userData.session.user }, "Successfully verify user");
      return redirect("/avatar", { headers });
    }
    logger.error(error);
  }

  return actionResponse(
    { error: { message: "Error with confirmation link or expired" } },
    { status: 403 }
  );
}

export async function getUser(request: Request) {
  return await getSupabaseServerClient(request, new Headers()).auth.getUser();
}

export async function authenticationGuard(
  request: Request,
  headers = new Headers()
) {
  logger.info("Verifying user session");
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
