import React, { useEffect, useState, useMemo, ChangeEventHandler } from "react";
import axios, { Canceler } from "axios";

import { useDropzone } from "react-dropzone";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  chakra,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAuthentication, useConfig } from "~/hooks";
import { useFormContext } from "react-hook-form";

import { FormNavigationBlock, FieldErrorMessage } from ".";

import { authentication } from "~/services";
import { BeatLoader } from "react-spinners";

const baseStyle = {
  boxSizing: "border-box",
  p: "4",
  position: "absolute",
  t: 0,
  l: 0,
  w: "100%",
  h: "100%",
  borderWidth: 2,
  borderRadius: "lg",
  borderColor: "gray.400",
  borderStyle: "soldi",
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
  bg: "green.200",
};

const rejectStyle = {
  borderColor: "red.600",
  bg: "red.400",
};


const isUploadedStyle = {
  borderColor: "green.200",
  bg: "green.200",

  _hover: {
    bg: "green.200"
  }
};

export interface FieldImageUploaderSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
  accept?: string;
  minFileSize?: number; // in bytes 1024 * 1024 = 1MB
  maxFileSize?: number; // in bytes 1024 * 1024 = 1MB
  aspectRatioPB: number; // the aspect ratios padding bottom
}
const initialProgressInfo = {
  loaded: 0,
  total: 0,
  percent: 0,
};

let requestCanceler: Canceler | undefined;

export const ImageUploader = ({
  settings,
  id,
  label,
  name,
  isRequired,
  isDisabled,
}: {
  settings?: FieldImageUploaderSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
}) => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const config = useConfig();

  const [progressInfo, setProgressInfo] = useState(initialProgressInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  
  const {
    formState: { errors },
    register
  } = useFormContext();

  // make sure to cancel ongoing uploads when component unmounts
  useEffect(() => {
     
    return () => {
      if (typeof requestCanceler === "function")
        requestCanceler()
      
      requestCanceler = undefined;
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TODO: refresh until processed
  // SHOW diffent states on profile page 
  // ImageComponent for easy preview
  // 

  const {
    acceptedFiles,
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
    onDropRejected: async (files) => {
      console.log("asdfdsafsda")
    },
    onDropAccepted: async (files) => {
      console.log(acceptedFiles);
      try {
        if (appUser) {
          setIsUploading(true);

          const formData = new FormData();
          formData.append("image", files[0]);
          formData.append("ownerId", `${appUser.id}`);
          
          await axios
            .request({
              method: "post",
              url: `${config.apiUrl}/profileImage`,
              headers: {
                "Content-Type": "multipart/form-data",
                authorization: `Bearer ${authentication.getAuthToken()}`,
              },
              cancelToken: new axios.CancelToken((c) => {
                // the presence of an request canceller does also allow to monitor if the progress state 
                // should be set further below.
                requestCanceler = c;
              }),
              data: formData,
              onUploadProgress: (ev) => {
                if (requestCanceler)
                  setProgressInfo({
                    loaded: ev.loaded,
                    total: ev.total,
                    percent: Math.round(ev.loaded/ev.total*100),
                  });
              },
            })
            .then((data) => {              
              if (requestCanceler) {
                setIsUploading(false);
                setIsUploaded(true);
              }
              requestCanceler = undefined;              
            })
            .catch((error) => {
              if (requestCanceler) {
                setIsUploading(false);
                setProgressInfo(initialProgressInfo);
                setIsUploadError(true);
              }
              requestCanceler = undefined;
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
      ...(isUploaded ? isUploadedStyle : {}),
      ...(isDragReject ? rejectStyle : {}),      
    }),
    [isDragActive, isDragReject, isDragAccept, isUploading, isUploaded]
  );

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
        <input name={`${name}_dropzone`} {...getInputProps()} />

        <Box
          position="relative"
          pb={`${settings?.aspectRatioPB ?? 66.66}%`}
          h="0"
          w="100%"
        >
          {!isUploaded && (
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

              {isUploading && progressInfo.total > 0.01 && (
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
              )}
            </Flex>
          )}
          {isUploaded && (
            <Flex
              justifyContent="center"
              textAlign="center"
              alignItems="center"
              flexDirection="column"
              sx={style}
            >
                 <Text pb="4">
                  {t(
                    "imagedropzone.imageuploaded",
                    "Image successful uploaded. We are processing it now"
                  )}
                </Text>

                <BeatLoader />
              
            </Flex>
          )}
        </Box>

        <input
          {...{ valid: !errors[name]?.message ? "valid" : undefined }}
          type="hidden"
          value={settings?.defaultValue}
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

export default ImageUploader;
