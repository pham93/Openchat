import { useForm } from "react-hook-form";
import { Link, Form as RemixForm, useActionData } from "@remix-run/react";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  FormField,
  FormItem,
  Form,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { userLoginSchema, IUserLogin } from "~/types/user.schema";
import { createLogger } from "~/utils/logger";
import { signin } from "~/services/auth.service";
import { actionResponse } from "~/utils/actionResponse";
import { SubmitButton } from "~/components/ui/submitButton";
import { validate } from "~/utils/validate";

const logger = createLogger("LoginPage");

export async function action({ request }: ActionFunctionArgs) {
  const responseHeaders = new Headers();
  const result = await validate(request, userLoginSchema);

  logger.info(`Logging in as ${result.email}`);
  const { data, error: signinError } = await signin(
    request,
    responseHeaders,
    result
  );

  if (data?.session && data?.user?.email_confirmed_at && !signinError) {
    return redirect("/create", { headers: responseHeaders });
  }

  return actionResponse({ error: signinError });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  const form = useForm<IUserLogin>({
    resolver: zodResolver(userLoginSchema),
    mode: "onChange",
    errors: actionData?.formError,
  });
  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Login to start interacting
          <p className="text-red-400">{actionData?.error?.message}</p>
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <RemixForm method="post">
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Provide email"
                      {...field}
                      autoComplete="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Provide password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <Link to="../resend" className="text-blue-300 text-sm -mt-2 ml-1">
              Forgot password?
            </Link>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Link prefetch="intent" to="../signup" className="text-blue-300">
              Sign up
            </Link>
            <SubmitButton valid={form.formState.isValid}>Login</SubmitButton>
          </CardFooter>
        </RemixForm>
      </Form>
    </>
  );
}
