import React from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "~/hooks";

export const MultiLangValue = ({ json }: { json: Record<string, string> }) => {
  
  const { t, i18n } = useTranslation();
  const config = useConfig();

  let value = json[i18n.language] ?? json[config.defaultLanguage ?? ""] ?? t("translationnotfound", "Trans. not found");

  return <>{value}</>;
};
