import React from "react";
import { useTranslation } from "next-i18next";
import { Button, HStack } from "@chakra-ui/react";
import { useConfig } from "~/hooks";

export const InlineLanguageButtons = () => {
  const config = useConfig();
  const { i18n } = useTranslation();
  return (
    <HStack spacing="2">
      {config.activeLanguages &&
        config.activeLanguages.map((lang) => (
          <Button
            key={lang}
            size="sm"
            onClick={() => i18n.changeLanguage(lang)}
            disabled={i18n.language === lang}
            textTransform="uppercase"
          >
            {lang}
          </Button>
        ))}
    </HStack>
  );
};
