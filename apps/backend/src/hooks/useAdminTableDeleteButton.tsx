import React, { useState } from "react";
import { DocumentNode, useMutation } from "@apollo/client";
import {
  useConfig,
  useSuccessfullyDeletedToast,
  useAuthentication,
} from "~/hooks";
import { DangerZoneAlertDialog } from "~/components/ui";
import { useTranslation } from "react-i18next";

type dZADState = {
  open: boolean;
  id: number | undefined;
};

type useAdminTableDeleteButtonOptions = {
  requireTextualConfirmation?: boolean;
  title?: string;
  message?: string;
};

export const useAdminTableDeleteButton = (
  deleteMutationGQL: DocumentNode,
  refetch: () => void,
  options?: useAdminTableDeleteButtonOptions
) => {
  const { requireTextualConfirmation = false, title, message } = options ?? {};

  const { t } = useTranslation();
  const [appUser] = useAuthentication();
  const config = useConfig();
  const [deleteMutation, { loading, error, data }] =
    useMutation(deleteMutationGQL);
  const successfullyDeletedToast = useSuccessfullyDeletedToast();
  const [dZAD, setDZAD] = useState<dZADState>({
    open: false,
    id: undefined,
  });
  const [isDeleteError, setIsDeleteError] = useState(false);

  const deleteButtonOnClick = (id: number) => {
    setDZAD({
      open: true,
      id,
    });
  };

  const onDeleteNo = () => {
    setDZAD({
      open: false,
      id: undefined,
    });
  };

  const onDeleteYes = async () => {
    try {
      if (appUser) {
        const { errors } = await deleteMutation({
          variables: {
            id: dZAD.id,
            scope: config.scope,
          },
        });
        if (!errors) {
          setDZAD({
            open: false,
            id: undefined,
          });

          refetch.call(null);

          setIsDeleteError(false);
          successfullyDeletedToast();
        } else {
          setIsDeleteError(true);
        }
      } else {
        setIsDeleteError(true);
      }
    } catch (err) {
      setIsDeleteError(true);
    }
  };

  const DZAD = (
    <DangerZoneAlertDialog
      title={
        title ? title : t("module.users.deletealter.title", "Please confirm")
      }
      message={
        message
          ? message
          : t(
              "module.users.deletealter.message",
              "Do you really want to delete the user? Once done we cannot revert this action!"
            )
      }
      requireTextualConfirmation={requireTextualConfirmation}
      isOpen={dZAD.open}
      onNo={onDeleteNo}
      onYes={onDeleteYes}
    />
  );

  return [
    deleteButtonOnClick,
    DZAD,
    isDeleteError,
    {
      deleteMutationLoading: loading,
      deleteMutationError: error,
      deleteMutationData: data,
    },
  ] as const;
};
