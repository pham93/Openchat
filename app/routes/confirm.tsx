import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { confirmEmail } from "~/services/auth.service";
import {
  Form as RemixForm,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
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
import { SubmitButton } from "~/components/ui/submitButton";
import { validate } from "~/utils/validate";
import { actionResponse } from "~/utils/actionResponse";
import { z } from "zod";

const emailSchema = z.object({ email: userSchema.shape["email"] });

export async function loader({ request }: LoaderFunctionArgs) {
  return await confirmEmail(request);
}

export async function action({ request }: ActionFunctionArgs) {
  const result = await validate(request, emailSchema);
  const { error } = await getSupabaseServerClient(request).auth.resend({
    email: result.email,
    type: "signup",
  });

  if (error) {
    return actionResponse({ error }, { status: 400 });
  }
  return actionResponse({ data: "Successfully resend" });
}

export default function ConfirmPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const form = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  return (
    <>
      <CardHeader>
        <CardDescription className="text-red-400">
          {loaderData?.error?.message}
        </CardDescription>
        {actionData?.data && (
          <div className="w-full h-[100px] rounded-md bg-green-300">
            {actionData.data}
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
            <SubmitButton valid={form.formState.isValid}>Resend</SubmitButton>
          </CardFooter>
        </RemixForm>
      </Form>
    </>
  );
}
