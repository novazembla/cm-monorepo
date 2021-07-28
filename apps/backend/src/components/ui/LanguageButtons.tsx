import React from 'react'
import { useTranslation } from "react-i18next";
import { Button, HStack } from "@chakra-ui/react";

export const LanguageButtons = () => {
  const { i18n } = useTranslation();
  return (
    <HStack position="fixed" bottom={{base:4, t:5, d:6}} left={{base:2, t:4, d:6}} spacing="2">

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

