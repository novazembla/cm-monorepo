import React from "react";
import { HelperText } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

type TypeErrorMessage = {
  key: string;
  values: object;
}
type ComonentProps = {
  error: TypeErrorMessage | string;
}
const ErrorMessage = ({ error }: ComonentProps): JSX.Element | null  => {
  const { t } = useTranslation();

  let message;

  if (typeof error === "string") {
    message = t(error);
  } else if (typeof error === "object" && error.key && error.values) {
    message = t(error.key, error.values);
  }

  if (!message || message.trim().length === 0) return null;

  // make sure first character is uppder case
  message = message.charAt(0).toUpperCase() + message.slice(1);

  return <HelperText valid={false}>{message}</HelperText>;
};

export default ErrorMessage;
