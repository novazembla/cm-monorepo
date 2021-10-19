import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  locationsSearchGQL,
  toursSearchGQL,
  eventsSearchGQL,
} from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { useSettingsUpdateMutation } from "~/hooks/mutations";
import {
  useAuthentication,
  useSuccessfullySavedToast,
  useConfig,
} from "~/hooks";
import {
  FieldSingleSelectAutocomplete,
  FieldMultiLangTextEditor,
  FieldSelect,
} from "~/components/forms";

import {
  HiOutlineTrash,
  HiArrowNarrowUp,
  HiArrowNarrowDown,
} from "react-icons/hi";
import { MdPlusOne } from "react-icons/md";

import {
  Divider,
  Box,
  chakra,
  HStack,
  IconButton,
  Button,
  Flex,
} from "@chakra-ui/react";
import { settingsQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { multiLangRHFormDataToJson } from "~/utils";

import { ModuleDashboardSchema } from "./forms";
import { multiLangFields } from "./moduleConfig";

const getJsonValue = (settings: any[], key: string) => {
  if (!settings || !Array.isArray(settings) || settings.length === 0)
    return undefined;

  const setting = settings.find((s) => s.key === key);
  if (setting) return setting?.value?.json;

  return undefined;
};

const defaultType = "event";

const Update = () => {
  const config = useConfig();

  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const { data, loading, error } = useQuery(settingsQueryGQL, {
    variables: {
      scope: "homepage",
    },
  });

  const [firstMutation, firstMutationResults] = useSettingsUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleDashboardSchema),
  });

  const {
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const { fields, remove, swap, insert, append } = useFieldArray({
    control,
    name: "highlights",
    keyName: "fieldId",
  });

  useEffect(() => {
    if (
      !data ||
      !data.settings ||
      !Array.isArray(data.settings) ||
      data.settings.length === 0
    )
      return;

    reset(
      data.settings.reduce((acc: any, setting: any) => {
        if (
          setting.key === "highlights" &&
          setting?.value?.json &&
          Array.isArray(setting?.value?.json)
        )
          return {
            ...acc,
            highlights: setting.value.json.reduce(
              (acc: any[], highlight: any) => {
                try {
                  acc.push({
                    type: highlight.type ?? defaultType,
                    id: highlight.id,
                    item: highlight.item,
                  });
                } catch (err) {}
                return acc;
              },
              []
            ),
          };

        if (setting.key === "missionStatement" && setting?.value?.json)
          return {
            ...acc,
            ...Object.keys(setting?.value?.json).reduce(
              (accMs, lang) => ({
                ...accMs,
                [`missionStatement_${lang}`]: setting.value.json[lang],
              }),
              {}
            ),
          };

        return acc;
      }, {})
    );
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleDashboardSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const multiLangNewData = multiLangRHFormDataToJson(
          newData,
          multiLangFields,
          config.activeLanguages
        );

        const { errors } = await firstMutation([
          {
            key: "missionStatement",
            scope: "homepage",
            value: multiLangNewData?.missionStatement ?? {},
          },
          {
            key: "highlights",
            scope: "homepage",
            value: newData?.highlights ?? [],
          },
        ]);

        if (!errors) {
          successToast();
          reset(
            {},
            {
              keepDirty: false,
              keepValues: true,
            }
          );
        } else {
          setHasFormError(true);
        }
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  const breadcrumb = [
    {
      title: t("mainnav.homepage.title", "Homepage"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.save", "Save"),
      userCan: "settingUpdate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={!isNavigatingAway && isDirty && !isSubmitting}
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView />
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage isLoading={loading} isError={!!error}>
              {hasFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <chakra.fieldset
                border="1px solid"
                borderColor="gray.400"
                p="4"
                borderRadius="md"
                w="100%"
              >
                <legend>
                  <chakra.span px="2">
                    {t("module.homepage.field.label.highlights", "Highlights")}
                  </chakra.span>
                </legend>

                <Box>
                  {fields && fields.length > 0 && (
                    <Box borderTop="1px solid" borderColor="gray.300" pt="2">
                      {fields.map((f: any, index) => {
                        const currentType = getValues(
                          `highlights[${index}].type`
                        );
                        let searchGQL = eventsSearchGQL;

                        if (currentType === "location")
                          searchGQL = locationsSearchGQL;

                        if (currentType === "tour") searchGQL = toursSearchGQL;

                        return (
                          <Flex
                            key={f.fieldId}
                            borderBottom="1px solid"
                            borderColor="gray.300"
                            pb="3"
                            mb="3"
                            w="100"
                            justifyContent="space-between"
                          >
                            <Box minW="150px">
                              <FieldSelect
                                name={`highlights[${index}].type`}
                                id={`highlights[${index}].type`}
                                label={t(
                                  "module.homepage.field.type.label",
                                  "Type"
                                )}
                                isRequired={true}
                                options={[
                                  {
                                    value: "location",
                                    label: t(
                                      "module.homepage.field.type.location.label",
                                      "Location"
                                    ),
                                  },
                                  {
                                    value: "event",
                                    label: t(
                                      "module.homepage.field.type.event.label",
                                      "Event"
                                    ),
                                  },
                                  {
                                    value: "tour",
                                    label: t(
                                      "module.homepage.field.type.tour.label",
                                      "Tour"
                                    ),
                                  },
                                ].sort((a: any, b: any) => {
                                  if (a.label < b.label) return -1;
                                  if (a.label > b.label) return 1;
                                  return 0;
                                })}
                                settings={{
                                  onChange: () => {
                                    setValue(
                                      `highlights[${index}].id`,
                                      undefined
                                    );
                                    setValue(
                                      `highlights[${index}].item`,
                                      undefined
                                    );
                                  },
                                  hideLabel: true,
                                  defaultValue: f.type ?? defaultType,
                                }}
                              />
                            </Box>
                            <Box flexGrow={2} px="3">
                              <FieldSingleSelectAutocomplete
                                name={`highlights[${index}].id`}
                                id={`highlights[${index}].id`}
                                label={t(
                                  "module.homepage.forms.field.label.searchitem",
                                  "Search item"
                                )}
                                isRequired={false}
                                item={f.item}
                                searchQueryGQL={searchGQL}
                                searchQueryDataKey={`${currentType}s`}
                                settings={{
                                  hideLabel: true,
                                  placeholder: t(
                                    "module.homepage.field.autocomplete",
                                    "Please enter a search phrase"
                                  ),
                                  onItemChange: (item: any) => {
                                    setValue(`highlights[${index}].item`, item);
                                  },
                                }}
                              />
                            </Box>
                            <Box>
                              <HStack>
                                <IconButton
                                  aria-label={t(
                                    "module.homepage.field.button.delte",
                                    "Delete highlight"
                                  )}
                                  fontSize="xl"
                                  colorScheme="red"
                                  variant="outline"
                                  icon={<HiOutlineTrash />}
                                  onClick={() => {
                                    setValue(
                                      `highlights[${index}].id`,
                                      undefined
                                    );
                                    setValue(
                                      `highlights[${index}].type`,
                                      undefined
                                    );

                                    remove(index);
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
                                    "module.homepage.field.button.addOneBelow",
                                    "Add new highlight below the current one"
                                  )}
                                  variant="outline"
                                  icon={<MdPlusOne />}
                                  fontSize="xl"
                                  onClick={() => {
                                    insert(index + 1, {
                                      id: undefined,
                                      item: undefined,
                                      type: defaultType,
                                    });
                                  }}
                                />
                              </HStack>
                            </Box>
                          </Flex>
                        );
                      })}
                    </Box>
                  )}
                  {(!fields || fields.length === 0) && (
                    <Box>
                      {t(
                        "module.homepage.field.highlights.noneConfigured",
                        "No highlights configured. Add the first highlight using the button below."
                      )}
                    </Box>
                  )}

                  <Flex justifyContent="flex-end">
                    <Button
                      onClick={() => {
                        append({
                          id: undefined,
                          type: defaultType,
                          item: undefined,
                        });
                      }}
                    >
                      {t(
                        "module.homepage.field.highlights.add",
                        "Add highlight"
                      )}
                    </Button>
                  </Flex>
                </Box>
              </chakra.fieldset>
              <Divider mt="10" />
              <FieldMultiLangTextEditor
                name="missionStatement"
                id="missionStatement"
                type="basic"
                label={t(
                  "module.homepage.field.label.missionStatement",
                  "Mission statement"
                )}
                isRequired={false}
                settings={{
                  defaultRequired: true,
                  defaultValues: getJsonValue(
                    data?.settings,
                    "missionStatement"
                  ),
                  maxLength: 250,
                  placeholder: t(
                    "module.homepage.field.placeholder.missionStatement",
                    "Short mission statement shown on the homepage ..."
                  ),
                }}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
