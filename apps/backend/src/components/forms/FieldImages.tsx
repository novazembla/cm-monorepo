import React from "react";
import { imageDeleteMutationGQL } from "@culturemap/core";

import { DocumentNode } from "@apollo/client";
import {
  Box,
  chakra,
  HStack,
  IconButton,
  Grid,
  Button,
  Flex,
} from "@chakra-ui/react";
import { FieldMultiLangInput, FieldRow, FieldImageUploader } from ".";
import { useTranslation } from "react-i18next";
import { useFormContext, useFieldArray } from "react-hook-form";

import {
  HiOutlineTrash,
  HiArrowNarrowUp,
  HiArrowNarrowDown,
} from "react-icons/hi";
import { MdPlusOne } from "react-icons/md";

import {
  TextErrorMessage,
} from "~/components/forms";

import { useDeleteByIdButton, useConfig } from "~/hooks";

export interface FieldImagesSettings {
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

export interface FieldImagesOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const FieldImages = ({
  settings,
  id,
  label,
  name,
  deleteButtonGQL = imageDeleteMutationGQL,
  currentImages,
  connectWith,
  setActiveUploadCounter,
}: {
  settings: FieldImagesSettings;
  id: string;
  deleteButtonGQL?: DocumentNode;
  isDisabled?: boolean;
  label: string;
  name: string;
  currentImages: any[] | undefined;
  connectWith?: any;
  setActiveUploadCounter?: Function;
}) => {
  const { t } = useTranslation();

  const { getValues, setValue, control } = useFormContext();

  const { fields, remove, swap, insert, append } = useFieldArray({
    control,
    name,
    keyName: "fieldId",
  });

  const config = useConfig();

  const [deleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(deleteButtonGQL, () => {}, {
      requireTextualConfirmation: false,
    });

  // t("validation.image.required", "Please upload an image")

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

      <Box>
        {fields && fields.length > 0 && (
          <Box borderTop="1px solid" borderColor="gray.300" pt="2">
            {isDeleteError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />                  
                </>
              )}

            {fields.map((f: any, index) => {
              return (
                <Box
                  key={f.fieldId}
                  borderBottom="1px solid"
                  borderColor="gray.300"
                  pb="3"
                  mb="3"
                >
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
                          name={`${name}[${index}].id`}
                          id={`${id}`}
                          label={t("form.field.images.label.image", "Image")}
                          isRequired={true}
                          canDelete={false}
                          deleteButtonGQL={deleteButtonGQL}
                          connectWith={connectWith}
                          
                          setActiveUploadCounter={setActiveUploadCounter}
                          settings={{
                            minFileSize:
                              settings?.minFileSize ?? 1024 * 1024 * 0.0977,
                            maxFileSize:
                              settings?.maxFileSize ?? 1024 * 1024 * 3,
                            aspectRatioPB: settings?.aspectRatio ?? 75, // % bottom padding

                            image: {
                              status: f?.status,
                              id: f?.id,
                              meta: f?.meta,
                              alt: label,
                              forceAspectRatioPB: settings?.aspectRatio ?? 75,
                              showPlaceholder: true,
                              sizes:
                                settings?.sizes ??
                                "(min-width: 45em) 20v, 95vw",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Flex
                        w="100%"
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        pb="2"
                        justifyContent="flex-end"
                      >
                        <HStack>
                          <IconButton
                            aria-label={t(
                              "form.field.images.button.deleteImage",
                              "Delte image"
                            )}
                            fontSize="xl"
                            colorScheme="red"
                            variant="outline"
                            icon={<HiOutlineTrash />}
                            onClick={() => {
                              const id = getValues(`${name}[${index}].id`);

                              if (id) {
                                deleteButtonOnClick(
                                  getValues(`${name}[${index}].id`),
                                  () => {
                                    if (!config.activeLanguages) return;

                                    setValue(`${name}[${index}].id`, "");
                                    setValue(`${name}[${index}].status`, "");
                                    setValue(`${name}[${index}].meta`, "");

                                    config.activeLanguages.forEach((lang) => {
                                      setValue(
                                        `${name}[${index}].alt_${lang}`,
                                        ""
                                      );
                                      setValue(
                                        `${name}[${index}].credits_${lang}`,
                                        ""
                                      );
                                    });

                                    remove(index);
                                  }
                                );
                              } else {
                                remove(index);
                              }
                            }}
                          />

                          <IconButton
                            aria-label={t(
                              "form.field.images.button.moveUp",
                              "Move up"
                            )}
                            fontSize="xl"
                            variant="outline"
                            icon={<HiArrowNarrowUp />}
                            onClick={() => swap(index - 1, index)}
                            isDisabled={index === 0}
                          />

                          <IconButton
                            aria-label={t(
                              "form.field.images.button.moveDown",
                              "Move down"
                            )}
                            fontSize="xl"
                            variant="outline"
                            icon={<HiArrowNarrowDown />}
                            onClick={() => swap(index, index + 1)}
                            isDisabled={index === fields.length - 1}
                          />

                          <IconButton
                            aria-label={t(
                              "module.events.forms.event.field.dates.clone",
                              "Clone current line"
                            )}
                            variant="outline"
                            icon={<MdPlusOne />}
                            fontSize="xl"
                            onClick={() => {
                              insert(index + 1, {
                                id: undefined,
                              });
                            }}
                          />
                        </HStack>
                      </Flex>

                      <FieldRow>
                        <FieldMultiLangInput
                          name={`${name}[${index}].alt`}
                          id={`${id}[${index}].alt`}
                          type="text"
                          label={t(
                            "form.field.images.label.alttext",
                            "Alternative text"
                          )}
                          settings={{
                            defaultRequired:
                              (!!settings.imageRequired &&
                                !!settings.altRequired) ||
                              !!getValues(name),
                            defaultValues: "",
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldMultiLangInput
                          name={`${name}[${index}].credits`}
                          id={`${name}[${index}].credits`}
                          type="text"
                          label={t(
                            "form.field.images.label.credits",
                            "Copyright information"
                          )}
                          settings={{
                            defaultRequired:
                              (!!settings.imageRequired &&
                                !!settings.creditsRequired) ||
                              !!getValues(name),
                            defaultValues: "",
                          }}
                        />
                      </FieldRow>
                    </Box>
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}
        {(!fields || fields.length === 0) && (
          <Box>
            {t(
              "form.field.images.noimages",
              "No additional images added. You can add further images by using the buttons below"
            )}
          </Box>
        )}

        <Flex justifyContent="flex-end">
          <Button
            onClick={() => {
              append({ id: undefined});
            }}
          >
            {t("form.field.images.addimage", "Add Image")}
          </Button>
        </Flex>
      </Box>
      {DeleteAlertDialog}
    </chakra.fieldset>
  );
};

export default FieldImages;
