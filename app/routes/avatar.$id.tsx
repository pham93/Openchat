import { Canvas } from "@react-three/fiber";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Chat } from "~/components/chat/Chat";
import { ChatProvider } from "~/components/chat/ChatProvider";
import { Scene } from "~/components/scene/Scene";
import { authenticationGuard } from "~/services/auth.service";
import { getAvatar } from "~/services/avatar.service";
import { actionResponse } from "~/utils/actionResponse";
import { getIndexedDb, storeAvatarLocally } from "~/utils/indexedDB.client";
import { createLogger } from "~/utils/logger";

const logger = createLogger("Avatar.$id");

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticationGuard(request);
  const avatarId = params.id;
  if (!avatarId) {
    throw "done";
  }
  logger.info({ avatarId }, "Retrieving avatar from server");
  const { data: avatar, error: avatarRetrievalError } = await getAvatar(
    request,
    avatarId
  );

  if (avatarRetrievalError) {
    logger.error(avatarRetrievalError);
    throw "done";
  }
  return actionResponse(
    { data: avatar, error: avatarRetrievalError },
    { headers: { "Cache-Control": "max-age=3600" } }
  );
}

export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  const { data, error } = await serverLoader<typeof loader>();

  if (!data || error) {
    throw "done";
  }
  const cachedAvatar = await getIndexedDb().avatars.get(data.id);

  if (!cachedAvatar && data.source_url && data.user_id) {
    logger.info(
      `${data.id} not in cached. Proceed to download and store locally`
    );
    await storeAvatarLocally({
      sourceUrl: data.source_url,
      avatarId: data.id,
      userId: data.user_id,
    });
  }
  const avatars = await getIndexedDb()
    .avatars.where({ userId: data.user_id })
    .toArray();

  return { data: { avatars } };
};

clientLoader.hydrate = true;

export default function Avatar() {
  const [isClient, setIsClient] = useState(false);

  const { data } = useLoaderData<typeof clientLoader>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <ChatProvider>
          <Chat />
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Scene avatars={data.avatars} />
          </Canvas>
        </ChatProvider>
      )}
    </>
  );
}
