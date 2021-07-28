import React from 'react'
import { useTranslation } from "react-i18next";
import { Button, HStack } from "@chakra-ui/react";

export const InlineLanguageButtons = () => {
  const { i18n } = useTranslation();
  return (<HStack spacing="2">
    <Button
        size="sm"
        onClick={() => i18n.changeLanguage("en")}
        disabled={i18n.language === "en"}
      >
        EN
      </Button>
      <Button
        size="sm"
        disabled={i18n.language === "de"}
        onClick={() => i18n.changeLanguage("de")}
      >
        DE
      </Button>
  </HStack>
  )
}

