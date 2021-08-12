import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const useSuccessToast = (defaultTitle: string, defaultMsg: string) => {
  const toast = useToast();

  const trigger = (
    title: string = defaultTitle,
    msg: string = defaultMsg
  ) => {
    toast({
      title: title,
      description: msg,
      status: "success",
      duration: 6000,
      isClosable: true,
      variant: "subtle",
      position: "bottom-right",
    });
  };

  return trigger;
}

export const useSuccessfullySavedToast = () => {
  const { t } = useTranslation();

  const defaultTitle = t("toast.title.success", "Success!");
  const defaultMsg = t("toast.info.datasaved", "The data has been saved");

  const toast = useSuccessToast(defaultTitle, defaultTitle);

  const trigger = (
    title: string = defaultTitle,
    msg: string = defaultMsg
  ) => {
    toast(title, msg);
  };

  return trigger;
};


export const useSuccessfullyDeletedToast = () => {
  const { t } = useTranslation();

  const defaultTitle = t("toast.title.success", "Success!");
  const defaultMsg = t("toast.info.datadeleted", "The data has been deleted");

  const toast = useSuccessToast(defaultTitle, defaultTitle);

  const trigger = (
    title: string = defaultTitle,
    msg: string = defaultMsg
  ) => {
    toast(title, msg);
  };

  return trigger;
};
