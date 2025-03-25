import { ZodError } from "zod";

export type FormError = Record<string, { message: string; type: string }>;

export function zodErrorsToFormErrors(errors: ZodError<unknown>): FormError {
  const errs = errors.flatten().fieldErrors as Record<string, string[]>;
  const entries = Object.entries(errs);
  const e: FormError = {};

  for (const [key, val] of entries) {
    e[key] = { message: val.join(","), type: "onChange" };
  }
  return e;
}
