import { useTranslation } from "react-i18next";
import { useToast, UseToastOptions } from "@chakra-ui/react";

export const useAppToast = (defaultTitle: string, defaultMsg: string, status: UseToastOptions["status"]) => {
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

  const toast = useAppToast(defaultTitle, defaultTitle, "success");

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

  const toast = useAppToast(defaultTitle, defaultTitle, "success");

  const trigger = (
    title: string = defaultTitle,
    msg: string = defaultMsg
  ) => {
    toast(title, msg);
  };

  return trigger;
};
