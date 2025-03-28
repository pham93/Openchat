import { ZodError, ZodType } from "zod";
import { tryCatch } from "./tryCatch";
import {
  genericErrorResponse,
  validationErrorResponse,
} from "./actionResponse";
import { zodErrorsToFormErrors } from "./zodMapper";
import { createLogger } from "./logger";

const logger = createLogger("Validate");

export const validate = async <T>(request: Request, schema: ZodType<T>) => {
  const payload = Object.fromEntries(await request.formData());
  const { result, error } = tryCatch(() => schema.parse(payload));

  if (error) {
    switch (true) {
      case error instanceof ZodError:
        logger.error(error, "Validation error");
        throw validationErrorResponse(zodErrorsToFormErrors(error));
      default:
        break;
    }
  }
  if (!result) {
    throw genericErrorResponse("Request body has no result");
  }

  return result;
};
