import { Canvas } from "@react-three/fiber";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Chat } from "~/components/chat/Chat";
import { ChatProvider } from "~/components/chat/ChatProvider";
import { Scene } from "~/components/scene/Scene";
import { authenticationGuard } from "~/services/auth.service";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticationGuard(request);
}

export default function Avatar() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <ChatProvider>
          <Chat />
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Scene />
          </Canvas>
        </ChatProvider>
      )}
    </>
  );
}
