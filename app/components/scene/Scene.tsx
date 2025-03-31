import { ContactShadows, Environment, CameraControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { useControls } from "leva";
import { type LocalAvatar } from "~/utils/indexedDB.client";
import { useNavigate, useParams } from "@remix-run/react";

export const Scene = ({
  avatars,
  avatar,
}: {
  avatars: LocalAvatar[];
  avatar?: LocalAvatar;
}) => {
  const cameraControls = useRef<CameraControls | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const { id } = useParams();
  const navigate = useNavigate();

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
          if (val !== id) {
            navigate({ pathname: `/avatar/${val}` }, { replace: true });
          }
        },
      },
    },
    [avatars, id]
  );

  useEffect(() => {
    if (!avatar?.model) {
      return;
    }
    setAvatarUrl(URL.createObjectURL(avatar.model));
  }, [avatar]);

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
