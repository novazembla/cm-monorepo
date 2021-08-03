import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Prompt } from "react-router-dom";

export const FormNavigationBlock = ({
  shouldBlock,
}: {
  shouldBlock: boolean;
}) => {
  const {t} = useTranslation();
  const message = t("form.unsavedchanges","It looks like you've unsaved changes. Leave without saving?");

  useEffect(() => {
    if (shouldBlock) {
      window.onbeforeunload = () => message
    } else {
      window.onbeforeunload = null
    }
    return () => {
      window.onbeforeunload = null
    }
  }, [shouldBlock, message])
  
  return <Prompt when={shouldBlock} message={message} />;
};
