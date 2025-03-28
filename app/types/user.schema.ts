import { z } from "zod";

export const userSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Not a valid email" }),
  confirmEmail: z
    .string({ required_error: "Username is required" })
    .email({ message: "Not a valid email" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password should be 8 characters" }),
});

export const userLoginSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Not a valid email" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password should be 8 characters" }),
  })
  .default({ email: "", password: "" });

export type IUser = z.infer<typeof userSchema>;
export type IUserLogin = z.infer<typeof userLoginSchema>;
