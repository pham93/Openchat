import { data } from "@remix-run/node";
import { FormError } from "./zodMapper";
import { DataWithResponseInit } from "@remix-run/router/dist/utils";
import { exceptionMapper } from "./exceptionMapper";

export function actionResponse<T, E>(
  data: IActionResponse<T, E>,
  options: ResponseInit
): DataWithResponseInit<IActionResponse<T, E>>;

export function actionResponse<T, E>(
  data: IActionResponse<T, E>
): IActionResponse<T, E>;

export function actionResponse<T, E>(
  res: IActionResponse<T, E>,
  options?: ResponseInit
) {
  if (res.error instanceof Error) {
    const { error, options: opt } = exceptionMapper(res.error);
    options = { ...options, ...opt };
    res.error = error as E;
  }

  if (options) {
    return data(res, options);
  }
  return res;
}

export function validationErrorResponse(formError: FormError) {
  return actionResponse(
    { formError },
    { status: 402, statusText: "Validation error" }
  );
}

export function genericErrorResponse(message: string) {
  return actionResponse(
    { error: { message } },
    { status: 500, statusText: message }
  );
}

export interface IActionResponse<T, E = Error> {
  data?: T;
  error?: E;
  formError?: FormError;
}
