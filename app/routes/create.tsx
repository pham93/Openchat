import { AvaturnSDK } from "@avaturn/sdk";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getIndexedDb } from "~/utils/indexedDB.client";

function createBlob(base64Url: string) {
  const base64 = base64Url.split(",")[1];
  const bytes = atob(base64);
  const byteNumbers = new Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    byteNumbers[i] = bytes.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: "model/gltf-binary" });
}

export default function Create() {
  const ref = useRef<HTMLDivElement | null>(null);

  const clientNavigate = useNavigate();

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
      url: "https://chatty.avaturn.dev/editor?customization_id=01957fb7-db94-7365-b998-f0215352e0ed",
    });

    sdk.on("export", async (e) => {
      try {
        const blob = createBlob(e.url);
        await getIndexedDb().avatars.put({ avatarId: e.avatarId, model: blob });
        clientNavigate(`/${e.avatarId}`);
      } catch (e) {
        console.error(e);
      }
    });
  }, [clientNavigate]);

  return <div className="h-screen" ref={ref}></div>;
}
