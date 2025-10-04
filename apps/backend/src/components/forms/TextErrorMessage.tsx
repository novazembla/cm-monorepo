import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@chakra-ui/react";

type TypeErrorMessage = {
  key: string;
  values: Record<string, unknown>;
};

export const TextErrorMessage = ({
  error
}: {
  error: TypeErrorMessage | string;  
}): JSX.Element | null => {
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

  return <Text pb="4" color="red.400" className="form-error">{message}</Text>;
};

export default TextErrorMessage;
