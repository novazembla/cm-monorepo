import React, { useState, useMemo, ChangeEventHandler, useEffect } from "react";
import axios from "axios";
import { DocumentNode } from "@apollo/client";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  chakra,
  IconButton,
  Text,
} from "@chakra-ui/react";

import { HiOutlineTrash } from "react-icons/hi";
import { ImCancelCircle } from "react-icons/im";

import { useTranslation } from "react-i18next";
import {
  useAuthentication,
  useConfig,
  useDeleteByIdButton,
  useAxiosCancelToken,
} from "~/hooks";
import { useFormContext } from "react-hook-form";

import { ApiFile, ApiFileProps } from "../ui";

import { FieldErrorMessage, flattenErrors } from ".";

import { authentication } from "~/services";

const humanFileSize = (
  size: number | undefined,
  decimalPlaces: number = 0
): string => {
  if (!size || size === 0) return "0";
  const i: number = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(decimalPlaces)} ${
    ["B", "KB", "MB", "GB", "TB"][i]
  }`;
};

const baseStyle = {
  boxSizing: "border-box",
  p: "4",
  position: "absolute",
  top: 0,
  left: 0,
  w: "100%",
  h: "100px",
  borderWidth: 1,
  borderRadius: "md",
  borderColor: "gray.400",
  borderStyle: "solid",
  bg: "gray.200",
  color: "gray.800",
  outline: "none",
  transition: "all .24s ease-in-out",
  cursor: "pointer",
  _hover: {
    boderColor: "gray.600",
    bg: "orange.200",
  },
};

const activeStyle = {
  bg: "orange.200",
};

const acceptStyle = {
  bg: "green.200",
  _hover: {
    bg: "green.200",
  },
};

const rejectStyle = {
  color: "#fff !important",
  bg: "red.400",
  _hover: {
    bg: "red.400",
  },
};

export interface FieldFileUploaderSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  className?: string;
  placeholder?: string;
  fileIdAsFieldValue?: boolean;
  valid?: boolean;
  accept?: string;
  minFileSize?: number; // in bytes 1024 * 1024 = 1MB
  maxFileSize?: number; // in bytes 1024 * 1024 = 1MB
  file?: ApiFileProps | null;
}

export type FieldFileUploaderProgessInfo = {
  loaded: number;
  total: number;
  percent: number;
};

export type FieldFileFormFunctions = {
  clearErrors: Function;
  setUploadedFileId: Function;
  setValue: Function;
};

const initialProgressInfo: FieldFileUploaderProgessInfo = {
  loaded: 0,
  total: 0,
  percent: 0,
};

export const FieldFileUploader = ({
  settings,
  id,
  label,
  name,
  isRequired,
  isDisabled,
  isPrivate,
  canDelete = true,
  deleteButtonGQL,
  onDelete,
  onUpload,
  connectWith,
  route = "file",
  setActiveUploadCounter,
  shouldSetFormDirtyOnUpload = false,
  shouldSetFormDirtyOnDelete = false,
  additionalFormData,
  additionalDeleteData,
}: {
  settings?: FieldFileUploaderSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isPrivate?: boolean;
  canDelete?: boolean;
  shouldSetFormDirtyOnUpload?: boolean;
  shouldSetFormDirtyOnDelete?: boolean;
  label: string;
  name: string;
  deleteButtonGQL: DocumentNode;
  onDelete?: (id?: number) => void;
  onUpload?: (data: any, formFunctions: FieldFileFormFunctions) => void;
  setActiveUploadCounter?: Function;
  connectWith?: any;
  route?: string;
  additionalFormData?: any[];
  additionalDeleteData?: {};
}) => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const config = useConfig();
  const { createNewCancelToken, isCancel, getCancelToken, getCanceler } =
    useAxiosCancelToken();
  const [progressInfo, setProgressInfo] =
    useState<FieldFileUploaderProgessInfo>(initialProgressInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState();
  const [fileIsDeleted, setfileIsDeleted] = useState(false);

  const [showFileDropError, setShowFileDropError] = useState(false);
  const [fileDropError, setFileDropError] = useState("");

  const {
    formState: { errors },
    register,
    setValue,
    clearErrors,
  } = useFormContext();

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxSize: settings?.maxFileSize ?? 1024 * 1024 * 2,
    minSize: settings?.minFileSize ?? undefined,
    disabled: isDisabled,
    multiple: false,
    accept: settings?.accept ?? undefined,
    onDropRejected: async (files) => {
      const file = files.shift();

      if (!file || file.errors.length === 0) return;

      setShowFileDropError(true);
      setFileDropError(file.errors[0].code);
    },
    onDropAccepted: async (files) => {
      try {
        if (appUser) {
          setIsUploading(true);
          setIsUploadError(false);
          const formData = new FormData();
          formData.append("file", files[0]);
          formData.append("ownerId", `${appUser.id}`);
          formData.append("connectWith", JSON.stringify(connectWith));

          if (Array.isArray(additionalFormData))
            additionalFormData.forEach((d) => {
              if (d?.name && typeof d?.value !== undefined)
                formData.append(d.name, d.value);
            });
            
          const cancelToken = createNewCancelToken();

          if (setActiveUploadCounter)
            setActiveUploadCounter((state: number) => state + 1);

          await axios
            .request({
              method: "post",
              url: `${config.apiUrl}/${route}`,
              headers: {
                "Content-Type": "multipart/form-data",
                ...(authentication.getAuthToken()
                  ? {
                      authorization: `Bearer ${
                        authentication.getAuthToken()?.token
                      }`,
                    }
                  : {}),
              },
              cancelToken,
              withCredentials: true,
              data: formData,
              onUploadProgress: (ev) => {
                if (getCancelToken())
                  setProgressInfo({
                    loaded: ev.loaded,
                    total: ev.total,
                    percent: Math.round((ev.loaded / ev.total) * 100),
                  });
              },
            })
            .then(({ data }: { data: any }) => {
              if (getCancelToken()) {
                setIsUploading(false);
                setfileIsDeleted(false);

                if (setActiveUploadCounter)
                  setActiveUploadCounter((state: number) => state - 1);

                if (typeof onUpload === "function") {
                  onUpload.call(this, data, {
                    clearErrors,
                    setUploadedFileId,
                    setValue,
                  });
                } else {
                  if (data?.id) {
                    clearErrors(name);
                    setUploadedFileId(data?.id ?? undefined);
                    setValue(name, data?.id, {
                      shouldDirty: shouldSetFormDirtyOnUpload,
                    });
                  }
                }
              }
            })
            .catch((error) => {
              if (setActiveUploadCounter)
                setActiveUploadCounter((state: number) => state - 1);

              if (isCancel(error)) return;

              if (getCancelToken()) {
                setIsUploading(false);
                setProgressInfo(initialProgressInfo);
                setIsUploadError(true);
              }
            });
        }
      } catch (err) {
        console.error(err);
      }
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? { activeStyle } : {}),
      ...(isDragAccept || isUploading ? acceptStyle : {}),
      ...(isDragReject || showFileDropError ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept, isUploading, showFileDropError]
  );

  const [deleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      deleteButtonGQL,
      () => {
        setUploadedFileId(undefined);
        setfileIsDeleted(true);
        setIsUploading(false);
        setValue(name, undefined, { shouldDirty: shouldSetFormDirtyOnUpload });
        if (typeof onDelete === "function") onDelete.call(null);
      },
      {
        requireTextualConfirmation: false,
        additionalDeleteData
      }
    );

  let currentFile: any =
    settings?.file && settings?.file?.id ? settings.file : {};

  if (fileIsDeleted) currentFile = {};

  const showFile = (currentFile && currentFile?.id) || !!uploadedFileId;

  const hasMin = settings?.minFileSize && settings?.minFileSize > 0;
  const hasMax = settings?.maxFileSize && settings?.maxFileSize > 0;
  let fileSizeInfo = "";

  if (hasMin && hasMax) {
    fileSizeInfo = t(
      "fileuploader.filesizebetween",
      "Size between {{minFileSize}} and {{maxFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
        minFileSize: humanFileSize(settings?.minFileSize, 1),
      }
    );
  } else if (hasMax) {
    fileSizeInfo = t(
      "fileuploader.filesizebelow",
      "Size max. {{maxFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
      }
    );
  } else if (hasMin) {
    fileSizeInfo = t(
      "fileuploader.filesizeabove",
      "Size min. {{minFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
        minFileSize: humanFileSize(settings?.minFileSize, 1),
      }
    );
  }

  useEffect(() => {
    if (fileDropError === "") return;

    const timeout = setTimeout(() => {
      setFileDropError("");
      setShowFileDropError(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [fileDropError, setFileDropError, setShowFileDropError]);

  let fileDropErrorMessage = "";

  switch (fileDropError) {
    case "file-too-large":
      fileDropErrorMessage = t(
        "fileuploader.droperror.toolarge",
        "Chosen file is too large"
      );
      break;
    case "file-too-small":
      fileDropErrorMessage = t(
        "fileuploader.droperror.toosmall",
        "Chosen file is too small"
      );
      break;
    case "file-invalid-type":
      fileDropErrorMessage = t(
        "fileuploader.droperror.invalidtype",
        "Type of chosen file is not accepted"
      );
      break;
  }

  const flattenedErrors = flattenErrors(errors);

  return (
    <>
      <FormControl
        id={id}
        isInvalid={flattenedErrors[name]?.message || isDragReject}
        {...{ isRequired, isDisabled }}
      >
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>

        {showFile && (
          <Box position="relative" h="80px">
            <ApiFile
              id={uploadedFileId ?? currentFile?.id ?? undefined}
              status={currentFile?.status ?? 0}
              meta={currentFile?.meta}
              allowDownload={!!isPrivate}
            />
            {canDelete && (
              <IconButton
                position="absolute"
                top="3"
                right="3"
                fontSize="xl"
                icon={<HiOutlineTrash />}
                onClick={() => {
                  deleteButtonOnClick(uploadedFileId ?? currentFile?.id);
                }}
                aria-label={t("fileuploader.button.deletefile", "Delete file")}
                title={t("fileuploader.button.deletefile", "Delete file")}
              />
            )}
          </Box>
        )}
        {isDeleteError && (
          <Text fontSize="sm" mt="0.5" color="red.500">
            {t(
              "fileuploader.deletefile.error",
              "Unfortunately, we could not process you deletion request please try again later"
            )}
          </Text>
        )}
        {DeleteAlertDialog}

        {!showFile && (
          <Box h="100px" position="relative">
            <input name={`${name}_dropzone`} {...getInputProps()} />

            <Flex
              {...getRootProps({ className: "dropzone" })}
              justifyContent="center"
              textAlign="center"
              alignItems="center"
              flexDirection="column"
              sx={style}
              h="100"
            >
              {(!isUploading || progressInfo.total < 0.01) && (
                <>
                  {showFileDropError && (
                    <Text color="white" fontWeight="bold">
                      {fileDropErrorMessage}
                    </Text>
                  )}
                  {!showFileDropError && (
                    <Text w="90%">
                      {t(
                        "fileuploader.pleasedroporclick",
                        "Drag & drop an file here, or click to select one"
                      )}
                    </Text>
                  )}

                  {fileSizeInfo && <Text fontSize="sm">{fileSizeInfo}</Text>}
                </>
              )}

              {isUploading && progressInfo.total > 0.01 && (
                <>
                  <chakra.span fontSize="md">
                    {t("fileuploader.uploading", "Uploading")}
                    <br />
                    <chakra.span fontSize="xl">
                      {`${Math.round(
                        (progressInfo.loaded / progressInfo.total) * 100
                      )}`}
                      %
                    </chakra.span>
                  </chakra.span>

                  <IconButton
                    position="absolute"
                    top="3"
                    right="3"
                    fontSize="2xl"
                    icon={<ImCancelCircle />}
                    color="red.600"
                    bg="white"
                    borderColor="gray.600"
                    _hover={{
                      bg: "red.100",
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const canceler = getCanceler();
                      if (typeof canceler === "function") canceler();
                      setIsUploading(false);
                    }}
                    aria-label={t("fileuploader.cancelupload", "Cancel upload")}
                    title={t("fileuploader.cancelupload", "Cancel upload")}
                  />
                </>
              )}
            </Flex>
          </Box>
        )}
        {isUploadError && (
          <Text fontSize="sm" mt="0.5" color="red.500">
            {t(
              "fileuploader.error",
              "Unfortunately, we could not finish you upload please try again later"
            )}
          </Text>
        )}

        <input
          {...{ valid: !flattenedErrors[name]?.message ? "valid" : undefined }}
          type="hidden"
          defaultValue={currentFile?.id}
          {...register(name, {
            required: isRequired,
          })}
        />

        <FieldErrorMessage error={flattenedErrors[name]?.message} />
      </FormControl>
    </>
  );
};

export default FieldFileUploader;
