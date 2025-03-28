import { AvaturnSDK } from "@avaturn/sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useSupabaseClient } from "~/lib/supabase/superbase.provider";
import { authenticationGuard } from "~/services/auth.service";
import { config } from "~/utils/config";
import { getIndexedDb } from "~/utils/indexedDB.client";
import { tryCatch } from "~/utils/tryCatch";

async function getModel(url: string) {
  const response = await fetch(url, { redirect: "follow" });
  return await response.blob();
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticationGuard(request);
  const url = new URL(request.url);
  const avatarId = url.searchParams.get("avatarId");
  // validate the avatar belongs to this user

  const path = avatarId ? `editor?customization_id=${avatarId}` : "";
  return {
    url: `${config.AVATURN_URL}/${path}`,
  };
}

export default function Create() {
  const ref = useRef<HTMLDivElement | null>(null);

  const { url } = useLoaderData<typeof loader>();

  const clientNavigate = useNavigate();
  const supabase = useSupabaseClient();

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
        const blob = await getModel(url);
        await getIndexedDb().avatars.put({
          avatarId,
          model: blob,
          lastModified: new Date().getMilliseconds(),
          sourceUrl: url,
        });
      });
      if (error) {
        console.error(error);
        return;
      }
      clientNavigate(`/avatar/${avatarId}`);
    });
    return () => sdk.destroy();
  }, [clientNavigate, url, supabase]);

  return <div className="h-screen" ref={ref}></div>;
}
