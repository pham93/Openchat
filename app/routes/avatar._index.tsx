import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticationGuard } from "~/services/auth.service";
import { actionResponse } from "~/utils/actionResponse";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticationGuard(request);
  return actionResponse(
    {},
    { headers: { "Cache-Control": "max-age=3600, public" } }
  );
}

export default function AvatarPage() {
  return <Link to="/auth/logout">Logout</Link>;
}
