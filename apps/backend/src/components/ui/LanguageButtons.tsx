import React from 'react'
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";

const LanguageButtons = () => {
  const { i18n } = useTranslation();
  return (
    <div className="fixed left-1 bottom-1">
      <Button
        className={i18n.language === "en" ? "button-toggle-active" : ""}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </Button>
      <Button
        className={i18n.language === "de" ? "button-toggle-active" : ""}
        onClick={() => i18n.changeLanguage("de")}
      >
        DE
      </Button>
    </div>
  )
}

export default LanguageButtons
