import { Canvas } from "@react-three/fiber";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Chat } from "~/components/chat/Chat";
import { ChatProvider } from "~/components/chat/ChatProvider";
import { Scene } from "~/components/scene/Scene";

export const meta: MetaFunction = () => {
  return [
    { title: "Open Chat" },
    { name: "description", content: "Chat with avatar" },
  ];
};

export default function Index() {
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
