import React, { useState, useMemo, ChangeEventHandler } from "react";
import axios from "axios";
import { DocumentNode } from "@apollo/client";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  chakra,
  IconButton,
} from "@chakra-ui/react";

import { HiOutlineTrash } from "react-icons/hi";
import { ImCancelCircle } from "react-icons/im";

import { useTranslation } from "react-i18next";
import { useAuthentication, useConfig, useDeleteByIdButton, useAxiosCancelToken } from "~/hooks";
import { useFormContext } from "react-hook-form";

import { FormNavigationBlock, FieldErrorMessage } from ".";
import { ApiImage, ApiImageProps } from "~/components/ui";

import { authentication } from "~/services";

const baseStyle = {
  boxSizing: "border-box",
  p: "4",
  position: "absolute",
  t: 0,
  l: 0,
  w: "100%",
  h: "100%",
  borderWidth: 2,
  borderColor: "orange.200",
  borderStyle: "solid",
  backgroundColor: "orange.100",
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
  borderColor: "green.200",
  bg: "green.200",
  _hover: {
    bg: "green.200",
  },
};

const rejectStyle = {
  borderColor: "red.400",
  bg: "red.400",
  _hover: {
    bg: "red.400",
  },
};

export interface FieldImageUploaderSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  className?: string;
  placeholder?: string;
  currentImage?: any;
  imageIdAsFieldValue?: boolean;
  valid?: boolean;
  accept?: string;
  minFileSize?: number; // in bytes 1024 * 1024 = 1MB
  maxFileSize?: number; // in bytes 1024 * 1024 = 1MB
  aspectRatioPB: number; // the aspect ratios padding bottom
  image?: ApiImageProps;
}

export type FieldImageUploaderProgessInfo = {
  loaded: number;
  total: number;
  percent: number;
};

const initialProgressInfo: FieldImageUploaderProgessInfo = {
  loaded: 0,
  total: 0,
  percent: 0,
};

export const FieldImageUploader = ({
  settings,
  id,
  label,
  name,
  isRequired,
  isDisabled,
  deleteButtonGQL,
}: {
  settings?: FieldImageUploaderSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  deleteButtonGQL: DocumentNode;
}) => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const config = useConfig();
  const { createNewCancelToken, isCancel, getCancelToken, getCanceler } = useAxiosCancelToken();
  const [progressInfo, setProgressInfo] =
    useState<FieldImageUploaderProgessInfo>(initialProgressInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [uploadedImgId, setUploadedImgId] = useState();
  const [imageIsDeleted, setimageIsDeleted] = useState(false);
  const {
    formState: { errors },
    register,
    setValue,
  } = useFormContext();

  // TODO:
  // Better UI for filesize rejections ... 
  
  const {
    // TODO: Needed? acceptedFiles,
    // TODO: Needed? rejectedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxSize: settings?.maxFileSize ?? 1024 * 1024 * 100,
    //minSize: settings?.minFileSize ?? undefined,
    disabled: isDisabled,
    multiple: false,
    accept: settings?.accept ?? "image/*",
    // onDropRejected: async (files) => {
    //   // TODO: better handle rejections
    //   // Especially files too large rejections

    // },
    onDropAccepted: async (files) => {
      try {
        if (appUser) {
          setIsUploading(true);

          const formData = new FormData();
          formData.append("image", files[0]);
          formData.append("ownerId", `${appUser.id}`);

          const cancelToken = createNewCancelToken();
          
          await axios
            .request({
              method: "post",
              url: `${config.apiUrl}/profileImage`,
              headers: {
                "Content-Type": "multipart/form-data",
                ...(authentication.getAuthToken()
                  ? { authorization: `Bearer ${authentication.getAuthToken()}` }
                  : {}),
              },
              cancelToken,

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
            .then(({ data }) => {
              if (getCancelToken()) {
                setIsUploading(false);
                setimageIsDeleted(false);
                if (data?.id) {
                  setUploadedImgId(data?.id ?? undefined);
                  setValue(name, data?.id);
                }
              }
            })
            .catch((error) => {
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
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept, isUploading]
  );

  const [deleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      deleteButtonGQL,
      () => {
        setUploadedImgId(undefined);
        setimageIsDeleted(true);
        setIsUploading(false);
      },
      {
        requireTextualConfirmation: false,
      }
    );

  let currentImage: any =
    settings?.image && settings?.image?.id ? settings.image : {};

  if (imageIsDeleted) currentImage = {};

  const showImage = (currentImage && currentImage?.id) || !!uploadedImgId;

  return (
    <>
      <FormNavigationBlock shouldBlock={isUploading} />

      <FormControl
        id={id}
        isInvalid={errors[name]?.message || isDragReject}
        {...{ isRequired, isDisabled }}
      >
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>

        {showImage && (
          <Box position="relative">
            <ApiImage
              id={currentImage?.id ?? uploadedImgId ?? undefined}
              status={currentImage?.status ?? 0}
              meta={currentImage?.meta}
              forceAspectRatioPB={settings?.image?.forceAspectRatioPB}
              showPlaceholder={settings?.image?.showPlaceholder}
              alt={settings?.image?.alt ?? ""}
              sizes={settings?.image?.sizes}
            />
            <IconButton
                    position="absolute"
                    top="3"
                    right="3"
                    fontSize="xl"
                    icon={<HiOutlineTrash />}
                    onClick={() => {
                      deleteButtonOnClick(uploadedImgId ?? currentImage?.id);
                    }}
                    aria-label={t(
                      "module.profile.button.deleteimage",
                      "Delete profile image"
                    )}
                    title={t(
                      "module.profile.button.deleteimage",
                      "Delete profile image"
                    )}
                    />
                    
            
          </Box>
        )}
        {isDeleteError && (
          <p color="red.500">
            {t(
              "module.profile.deleteimage.error",
              "Unfortunately, we could not process you deletion request please try again later"
            )}
          </p>
        )}
        {DeleteAlertDialog}

        {!showImage && (
          <>
            <input name={`${name}_dropzone`} {...getInputProps()} />

            <Box
              position="relative"
              pb={`${settings?.aspectRatioPB ?? 66.66}%`}
              h="0"
              w="100%"
            >
              <Flex
                {...getRootProps({ className: "dropzone" })}
                justifyContent="center"
                textAlign="center"
                alignItems="center"
                sx={style}
              >
                {(!isUploading || progressInfo.total < 0.01) && (
                  <p>
                    {t(
                      "imagedropzone.pleasedroporclick",
                      "Drag & drop an image here, or click to select files"
                    )}
                  </p>
                )}

                {isUploading && progressInfo.total > 0.01 && (<>
                  <chakra.span fontSize="md">
                    {t("imagedropzone.uploading", "Uploading")}
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
                bg:"red.100"
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const canceler = getCanceler();
                if (typeof canceler === "function") canceler();
                setIsUploading(false);
              }}
              aria-label={t(
                "imageuploader.cancelupload",
                "Cancel upload"
              )}
              title={t(
                "imageuploader.cancelupload",
                "Cancel upload"
              )}/>
                    </>
                )}
              </Flex>
            </Box>
          </>
          
        )}
        {isUploadError && (
          <p color="red.500">
            {t(
              "imageuploader.error",
              "Unfortunately, we could not finish you upload please try again later"
            )}
          </p>
        )}

        <input
          {...{ valid: !errors[name]?.message ? "valid" : undefined }}
          type="hidden"
          defaultValue={settings?.currentImage?.id}
          {...register(name, {
            required: isRequired,
          })}
        />

        <FieldErrorMessage error={errors[name]?.message} />

        {isDragActive && isDragReject && (
          <FormErrorMessage mt="0.5">
            {t(
              "imagedropzone.filetypenotaccepted",
              "You can't upload this file"
            )}
          </FormErrorMessage>
        )}
      </FormControl>
    </>
  );
};

export default FieldImageUploader;
