import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticationGuard } from "~/services/auth.service";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticationGuard(request);
}

export default function AvatarPage() {
  return <Link to="/auth/logout">Logout</Link>;
}
