import { Canvas } from "@react-three/fiber";
import { useNavigate, useOutletContext, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Chat } from "~/components/chat/Chat";
import { ChatProvider } from "~/components/chat/ChatProvider";
import { Scene } from "~/components/scene/Scene";
import {
  getIndexedDb,
  LocalAvatar,
  storeAvatarLocally,
} from "~/utils/indexedDB.client";
import { createLogger } from "~/utils/logger";

const logger = createLogger("Avatar.$id");

const preloadAvatar = async (avatar: LocalAvatar) => {
  const cached = await getIndexedDb().avatars.get(avatar.avatarId);
  if (cached?.model) {
    return Promise.resolve(cached);
  }
  await storeAvatarLocally({
    avatarId: avatar.avatarId,
    sourceUrl: avatar.sourceUrl,
    userId: avatar.userId,
  });
  return await getIndexedDb().avatars.get(avatar.avatarId);
};

// export async function loader({ request, params }: LoaderFunctionArgs) {
//   const avatarId = params.id;
//   if (!avatarId) {
//     throw "done";
//   }
//   logger.info({ avatarId }, "Retrieving avatar from server");
//   const { data: avatar, error: avatarRetrievalError } = await getAvatar(
//     request,
//     avatarId
//   );

//   if (avatarRetrievalError) {
//     logger.error(avatarRetrievalError);
//     throw "done";
//   }

//   return actionResponse({ data: { avatar }, error: avatarRetrievalError });
// }

// export const clientLoader = async ({
//   serverLoader,
//   params,
// }: ClientLoaderFunctionArgs) => {
//   let cachedAvatar = await getIndexedDb().avatars.get(params.id as string);

//   if (cachedAvatar) {
//     return { data: { cachedAvatar } };
//   }

//   const { data } = await serverLoader<typeof loader>();

//   const avatar = data?.avatar;
//   if (avatar) {
//     logger.info(
//       `${avatar.id} not in cached. Proceed to download and store locally`
//     );
//     await storeAvatarLocally({
//       sourceUrl: avatar.source_url!,
//       avatarId: avatar.id,
//       userId: avatar.user_id!,
//     });
//     cachedAvatar = await getIndexedDb().avatars.get(avatar.id);
//   }

//   return { data: { cachedAvatar } };
// };

// clientLoader.hydrate = true;

export default function Avatar() {
  const [isClient, setIsClient] = useState(false);
  const { id } = useParams();
  const { avatars } = useOutletContext<{ avatars: LocalAvatar[] }>();
  const navigate = useNavigate();

  const [cachedAvatar, setCachedAvatar] = useState<LocalAvatar>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const avatar = avatars.find((e) => e.avatarId === id);
    if (!avatar) {
      // navigate("/avatar", { replace: true });
      return;
    }

    preloadAvatar(avatar).then((e) => {
      setCachedAvatar(e);
      // load the rest, don't wait
      Promise.allSettled(
        avatars.filter((e) => e.avatarId !== id).map((e) => preloadAvatar(e))
      ).then();
    });
  }, [avatars, id]);

  return (
    <>
      {isClient && (
        <ChatProvider>
          <Chat />
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            {cachedAvatar && <Scene avatars={avatars} avatar={cachedAvatar} />}
          </Canvas>
        </ChatProvider>
      )}
    </>
  );
}
