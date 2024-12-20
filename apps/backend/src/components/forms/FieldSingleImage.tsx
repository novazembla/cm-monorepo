import React from "react";
import { ImageCropPosition, imageDeleteMutationGQL } from "@culturemap/core";

import { DocumentNode } from "@apollo/client";
import { Box, chakra, Grid } from "@chakra-ui/react";
import {
  FieldMultiLangInput,
  FieldRow,
  FieldImageUploader,
  FieldImageCropPositionSelect,
} from ".";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { useConfig } from "~/hooks";

export interface FieldSingleImageSettings {
  imageRequired?: boolean;
  altRequired?: boolean;
  creditsRequired?: boolean;
  placeholder?: string;
  valid?: boolean;
  minFileSize?: number;
  maxFileSize?: number;
  aspectRatio?: number;
  sizes?: string;
}

export interface FieldSingleImageOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const FieldSingleImage = ({
  settings,
  id,
  label,
  name,
  deleteButtonGQL = imageDeleteMutationGQL,
  currentImage,
  connectWith,
  setActiveUploadCounter,
  doNotCollectCropPosition,
  activeLanguages,
}: {
  settings: FieldSingleImageSettings;
  id: string;
  deleteButtonGQL?: DocumentNode;
  isDisabled?: boolean;
  doNotCollectCropPosition?: boolean;
  label: string;
  name: string;
  currentImage: Record<string, any>;
  connectWith?: any;
  setActiveUploadCounter?: Function;
  activeLanguages?: string[];
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { setValue, getValues, watch } = useFormContext();

  let mappedCropPosition = "center";

  const watchedValue = watch(`${name}_cropPosition`)
    ? parseInt(watch(`${name}_cropPosition`))
    : 0;

  switch (watchedValue) {
    case ImageCropPosition.TOP:
      mappedCropPosition = "top";
      break;

    case ImageCropPosition.RIGHT:
      mappedCropPosition = "right";
      break;

    case ImageCropPosition.BOTTOM:
      mappedCropPosition = "bottom";
      break;

    case ImageCropPosition.LEFT:
      mappedCropPosition = "left";
      break;

    default:
      mappedCropPosition = "center";
      break;
  }

  return (
    <chakra.fieldset
      border="1px solid"
      borderColor="gray.400"
      p="4"
      borderRadius="md"
      w="100%"
    >
      <legend>
        <chakra.span px="2">{label}</chakra.span>
      </legend>
      <Grid
        templateColumns={{ base: "100%", t: "max(20%,320px) 1fr" }}
        templateRows={{ base: "auto 1fr", t: "auto" }}
        gap={{ base: "4", s: "6" }}
      >
        <Box>
          <Box
            w={{ base: "100%", t: "100%" }}
            maxW={{ base: "350px", t: "100%" }}
          >
            <FieldImageUploader
              name={`${name}`}
              id={`${id}`}
              label={t("form.image.label.image", "Image")}
              isRequired={!!settings.imageRequired}
              deleteButtonGQL={deleteButtonGQL}
              connectWith={connectWith}
              onDelete={() => {
                if (!config.activeLanguages) return;

                config.activeLanguages.forEach((lang) => {
                  setValue(`${name}`, "");
                  setValue(`${name}_alt_${lang}`, "");
                  setValue(`${name}_credits_${lang}`, "");
                });
              }}
              objectFit="cover"
              objectPosition={mappedCropPosition}
              setActiveUploadCounter={setActiveUploadCounter}
              settings={{
                minFileSize: settings?.minFileSize ?? 1024 * 1024 * 0.0977,
                maxFileSize: settings?.maxFileSize ?? 1024 * 1024 * 12,
                aspectRatioPB: settings?.aspectRatio ?? 75, // % bottom padding

                image: {
                  status: currentImage?.status,
                  id: currentImage?.id,
                  meta: currentImage?.meta,
                  alt: label,
                  forceAspectRatioPB: settings?.aspectRatio ?? 75,
                  showPlaceholder: true,
                  sizes: settings?.sizes ?? "(min-width: 45em) 20vw, 95vw",
                },
              }}
            />
          </Box>
        </Box>
        <Box>
          <FieldRow>
            <FieldMultiLangInput
              name={`${name}_alt`}
              id={`${id}_alt`}
              type="text"
              label={t("form.image.label.alttext", "Alternative text")}
              settings={{
                defaultRequired:
                  (!!settings.imageRequired && !!settings.altRequired) ||
                  !!getValues(name),
                defaultValues: currentImage?.alt ?? "",
              }}
              activeLanguages={activeLanguages}
            />
          </FieldRow>
          <FieldRow>
            <FieldMultiLangInput
              name={`${name}_credits`}
              id={`${name}_credits`}
              type="text"
              label={t("form.image.label.credits", "Copyright information")}
              settings={{
                defaultRequired:
                  (!!settings.imageRequired && !!settings.creditsRequired) ||
                  !!getValues(name),
                defaultValues: currentImage?.credits ?? "",
              }}
              activeLanguages={activeLanguages}
            />
          </FieldRow>
          {!doNotCollectCropPosition && (
            <FieldRow>
              <FieldImageCropPositionSelect
                name={`${name}_cropPosition`}
                cropPosition={currentImage?.cropPosition}
              />
            </FieldRow>
          )}
        </Box>
      </Grid>
    </chakra.fieldset>
  );
};

export default FieldSingleImage;
