import React from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "~/hooks";

export const MultiLangValue = ({ json }: { json: Record<string, string> }) => {
  
  const { t, i18n } = useTranslation();
  const config = useConfig();

  if (!json)
    return <></>;
    
  console.log(json);
  const defVal = json[config.defaultLanguage ?? ""] ? `${json[config.defaultLanguage ?? ""]} *`: undefined;

  let value = json[i18n.language] ?? defVal ?? t("translationnotfound", "Trans. not found");

  return <>{value}</>;
};
