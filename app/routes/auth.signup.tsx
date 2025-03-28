import { useForm } from "react-hook-form";
import { Form as RemixForm, useActionData } from "@remix-run/react";
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
import { ActionFunctionArgs } from "@remix-run/node";
import { createLogger } from "~/utils/logger";
import { signup } from "~/services/auth.service";
import { IUser, userSchema } from "~/types/user.schema";
import { SubmitButton } from "~/components/ui/submitButton";
import { validate } from "~/utils/validate";

const logger = createLogger("SignUp");

export async function action({ request }: ActionFunctionArgs) {
  const result = await validate(request, userSchema);
  logger.debug(`User registering with email: ${result.email}`);
  return await signup(request, result);
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();

  const form = useForm<IUser>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
    errors: actionData?.formError,
  });

  if (actionData?.data?.success) {
    return (
      <CardHeader>
        <CardTitle className="text-green-400">Sign Up Successful</CardTitle>
        <CardDescription>
          Please check your email for confirmation
        </CardDescription>
      </CardHeader>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Sign up for an account
          <p className="text-red-400">{actionData?.error?.message}</p>
        </CardDescription>
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
            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Confirm email address" {...field} />
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
                      placeholder="Enter Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton valid={form.formState.isValid}>Sign up</SubmitButton>
          </CardFooter>
        </RemixForm>
      </Form>
    </>
  );
}
