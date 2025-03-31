import {
  Outlet,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "react-router";
import { authenticationGuard } from "~/services/auth.service";
import { getAvatars } from "~/services/avatar.service";
import { actionResponse } from "~/utils/actionResponse";
import { LocalAvatar } from "~/utils/indexedDB.client";
import { createLogger } from "~/utils/logger";

const logger = createLogger(AvatarLayout.name);

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  // Allow revalidation on full page refresh (server-side or initial load)
  // Remix sets defaultShouldRevalidate to true on initial load or hard refresh
  if (currentUrl.pathname === nextUrl.pathname && defaultShouldRevalidate) {
    return true;
  }
  return false;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticationGuard(request);

  const { data, error } = await getAvatars(request, user.id);

  if (!data || error) {
    return actionResponse({ error }, { status: 400 });
  }

  logger.info(
    { avatars: data.length, user: user.email },
    "Retrieving avatars for user"
  );

  const localAvatars = (data ?? []).map<LocalAvatar>((e) => ({
    avatarId: e.id,
    sourceUrl: e.source_url!,
    userId: e.user_id!,
    lastModified: 0,
  }));
  return actionResponse({ data: localAvatars });
}

export default function AvatarLayout() {
  const { data } = useLoaderData<{ data: LocalAvatar[] }>();
  return <Outlet context={{ avatars: data }} />;
}
