import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticationGuard } from "~/services/auth.service";
import { getAvatars } from "~/services/avatar.service";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticationGuard(request);
  // validate the avatar belongs to this user
  const { data: avatars } = await getAvatars(request, user.id);
  const redirectUrl =
    avatars && avatars.length > 0 ? `/avatar/${avatars[0].id}` : `/create`;

  return redirect(redirectUrl);
}

export default function AvatarPage() {
  return <Link to="/auth/logout">Logout</Link>;
}
