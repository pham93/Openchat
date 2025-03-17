import { ContactShadows, Environment, CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

export const Scene = () => {
  const cameraControls = useRef<CameraControls | null>(null);

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

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="city" />
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
