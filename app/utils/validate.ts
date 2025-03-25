import { ZodError, ZodType } from "zod";
import { tryCatch } from "./tryCatch";
import {
  genericErrorResponse,
  validationErrorResponse,
} from "./actionResponse";
import { zodErrorsToFormErrors } from "./zodMapper";

export const validate = async <T>(request: Request, schema: ZodType<T>) => {
  const payload = Object.fromEntries(await request.formData());
  const { result, error } = tryCatch(() => schema.parse(payload));

  if (error) {
    switch (true) {
      case error instanceof ZodError:
        throw validationErrorResponse(zodErrorsToFormErrors(error));
      default:
        break;
    }
  }
  if (!result) {
    throw genericErrorResponse("request body has no result");
  }

  return result;
};
