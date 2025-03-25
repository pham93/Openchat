import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { confirmEmail } from "~/services/auth.service";
import {
  Form as RemixForm,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { IUser, userSchema } from "~/types/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { getSupabaseServerClient } from "~/lib/supabase/supabase.server";
import { tryCatch } from "~/utils/tryCatch";

export async function loader({ request }: LoaderFunctionArgs) {
  const { success, message } = await confirmEmail(request);
  if (success) {
    return redirect("/");
  }
  return data(message, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const payload = Object.fromEntries(await request.formData());
  const { result } = tryCatch(() =>
    userSchema.shape["email"].parse(payload.email)
  );
  if (result) {
    const { error } = await getSupabaseServerClient(
      request,
      new Headers()
    ).auth.resend({
      email: result,
      type: "signup",
    });

    if (error) {
      return { error: error.message, success: null };
    }
    return { success: "Verification sent!", error: null };
  }
  return { error: "error sending request", success: null };
}

export default function ConfirmPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const form = useForm<IUser>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  return (
    <>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
        <CardDescription className="text-red-400">{loaderData}</CardDescription>
        {actionData?.success && (
          <div className="w-full h-[100px] rounded-md bg-green-300">
            {actionData.success}
          </div>
        )}
      </CardHeader>
      <Form {...form}>
        <RemixForm method="post">
          <CardContent className="flex gap-2 flex-col">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={navigation.state === "submitting"}>
              Resend
            </Button>
          </CardFooter>
        </RemixForm>
      </Form>
    </>
  );
}
