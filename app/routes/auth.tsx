import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { getUser } from "~/services/auth.service";

export async function loader({ request }: LoaderFunctionArgs) {
  const { data } = await getUser(request);
  return data.user ? redirect("/avatar") : null;
}

export default function AuthLayout() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="flex flex-row w-[80%] max-w-[800px] h-auto min-h-[400px]">
        <img
          src="/cover.jpg"
          alt="cover"
          height={400}
          width={300}
          className="w-[50%] object-cover h-auto p-2 rounded-lg"
        />
        <Card className="w-full border-none">
          <Outlet />
        </Card>
      </Card>
    </div>
  );
}
