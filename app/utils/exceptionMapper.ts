import { createLogger } from "./logger";

const logger = createLogger("ExceptionMapper");
/**
 * Some errors should only return back a generic response.
 */
export function exceptionMapper(error: Error) {
  logger.error(error);
  switch (true) {
    default: {
      const error = new Error(
        "Something went wrong. Sorry, please try again later"
      );
      return { error, options: { status: 500, statusText: error.message } };
    }
  }
}
