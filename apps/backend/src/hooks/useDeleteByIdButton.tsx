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
  onDelete: Function | undefined;
};

type useDeleteByIdButtonOptions = {
  requireTextualConfirmation?: boolean;
  title?: string;
  message?: string;
  additionalDeleteData?: any;
};

export const useDeleteByIdButton = (
  deleteMutationGQL: DocumentNode,
  refetch: () => void,
  options?: useDeleteByIdButtonOptions
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
    onDelete: undefined,
  });
  const [isDeleteError, setIsDeleteError] = useState(false);
  
  const deleteButtonOnClick = (id: number, onDelete?: (id: number) => void) => {
    setDZAD({
      open: true,
      id,
      onDelete,
    });
  };

  const onDeleteNo = () => {
    setDZAD({
      open: false,
      id: undefined,
      onDelete: undefined,
    });
  };

  const onDeleteYes = async () => {
    try {
      if (appUser) {
        const { errors } = await deleteMutation({
          variables: {
            id: dZAD.id,
            scope: config.scope,
            ...(typeof options?.additionalDeleteData === "object" ? options?.additionalDeleteData : {}),
          },
        });
        if (!errors) {

          if (typeof dZAD.onDelete === "function")
            dZAD.onDelete.call(null, dZAD.id)

          setDZAD({
            open: false,
            id: undefined,
            onDelete: undefined,
          });

          refetch.call(null);

          setIsDeleteError(false);
          successfullyDeletedToast();


        } else {
          setIsDeleteError(true);
          setDZAD({
            open: false,
            id: undefined,
            onDelete: undefined,
          });
        }
      } else {
        setIsDeleteError(true);
        setDZAD({
          open: false,
          id: undefined,
          onDelete: undefined,
        });
      }
    } catch (err) {
      setIsDeleteError(true);
      setDZAD({
        open: false,
        id: undefined,
        onDelete: undefined,
      });
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
