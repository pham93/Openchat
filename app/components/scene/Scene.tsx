import { ContactShadows, Environment, CameraControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { useControls } from "leva";
import { type LocalAvatar } from "~/utils/indexedDB.client";
import { useParams } from "@remix-run/react";

export const Scene = ({ avatars }: { avatars: LocalAvatar[] }) => {
  const cameraControls = useRef<CameraControls | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const { id } = useParams();

  useEffect(() => {
    cameraControls.current?.setLookAt(
      -0.03093866316987083,
      1.9315039835244034,
      2.3941525517392788,
      0,
      1.5,
      0
    );
  }, [cameraControls]);

  useControls(
    "Change Avatar",
    {
      models: {
        value: id,
        options: avatars.map((e) => e.avatarId),
        onChange: (val: string) => {
          const avatar = avatars.find((e) => e.avatarId === val);
          avatar && setAvatarUrl(URL.createObjectURL(avatar.model));
        },
      },
    },
    [avatars]
  );

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment background preset="dawn" backgroundBlurriness={1} />
      <Suspense fallback={<group />}>
        {avatarUrl && <Avatar key={avatarUrl} url={avatarUrl} />}
      </Suspense>
      <ContactShadows opacity={0.7} />
    </>
  );
};
