import { Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";
import { useNavigation } from "@remix-run/react";
import { PropsWithChildren } from "react";

export const SubmitButton = ({
  valid,
  children,
}: PropsWithChildren & { valid: boolean }) => {
  const navigation = useNavigation();
  return (
    <Button
      type="submit"
      variant={"secondary"}
      disabled={navigation.state === "submitting" || !valid}
    >
      <Loader2
        className={cn(
          { hidden: navigation.state !== "submitting" },
          "animate-spin"
        )}
      />
      {children}
    </Button>
  );
};
