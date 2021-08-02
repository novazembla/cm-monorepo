import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const useSuccessToast = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const defaultTitle = t("toast.title.success", "Success!");
  const defaultMsg = t("toast.info.datasaved", "The data has been saved");

  const trigger = (
    title: string = defaultTitle,
    description: string = defaultMsg
  ) => {
    toast({
      title: title,
      description: description,
      status: "success",
      duration: 6000,
      isClosable: true,
      variant: "subtle",
      position: "bottom-right",
    });
  };

  return trigger;
};
