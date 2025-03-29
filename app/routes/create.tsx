import { AvaturnSDK } from "@avaturn/sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useSupabaseClient } from "~/lib/supabase/superbase.provider";
import { authenticationGuard } from "~/services/auth.service";
import { getAvatars } from "~/services/avatar.service";
import { config } from "~/utils/config";
import { storeAvatarLocally } from "~/utils/indexedDB.client";
import { tryCatch } from "~/utils/tryCatch";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticationGuard(request);
  const url = new URL(request.url);
  let path = "";
  const avatarId = url.searchParams.get("avatarId");
  // validate the avatar belongs to this user
  if (!avatarId) {
    const { data: avatars } = await getAvatars(request, user.id);
    path = avatars && avatars.length > 0 ? "" : "create/scan";
    console.log(avatars);
  } else {
    path = `editor?customization_id=${avatarId}`;
  }
  return {
    url: `${config.AVATURN_URL}/${path}`,
    user,
  };
}

export default function Create() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { url, user } = useLoaderData<typeof loader>();

  const clientNavigate = useNavigate();

  const { supabase } = useSupabaseClient();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
  }, [ref]);

  useEffect(() => {
    // is client

    const sdk = new AvaturnSDK();
    sdk.init(ref.current, {
      disableUi: false,
      url,
    });

    sdk.on("export", async ({ avatarId, url, ...other }) => {
      const { error } = tryCatch(async () => {
        if (other.urlType !== "httpURL") {
          return;
        }
        const { error: dbError } = await supabase.from("avatar").upsert({
          id: avatarId,
          user_id: user.id,
          source_url: url,
        });

        if (dbError) {
          console.error(error);
          return dbError;
        }
        await storeAvatarLocally({ sourceUrl: url, avatarId, userId: user.id });
      });
      if (error) {
        console.error(error);
        return;
      }
      clientNavigate(`/avatar/${avatarId}`);
    });
    return () => sdk.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="h-screen" ref={ref}></div>;
}
