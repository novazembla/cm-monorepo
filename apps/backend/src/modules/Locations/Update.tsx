import { useState, useEffect } from "react";
import type * as yup from "yup";
import { object, boolean, mixed, number } from "yup";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import pick from "lodash/pick";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleLocationUpdateSchema } from "./forms";
import { useLocationUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";
import { BsEye } from "react-icons/bs";
import {
  Divider,
  Heading,
  Table,
  Thead,
  Th,
  Box,
  Td,
  IconButton,
  Flex,
  HStack,
  chakra,
} from "@chakra-ui/react";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { ModuleForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  multiLangImageTranslationsRHFormDataToJson,
  multiLangImageTranslationsJsonRHFormData,
  mapGroupOptionsToData,
  mapDataToPrimaryTerms,
  mapPrimaryTermsToData,
  mapDataToGroupOptions,
} from "~/utils";

import { MultiLangValue } from "~/components/ui";

export const locationReadAndContentAuthorsQueryGQL = gql`
  query locationRead($id: Int!) {
    locationRead(id: $id) {
      id
      title
      slug
      description
      address
      contactInfo
      accessibilityInformation
      socialMedia
      geoCodingInfo

      offers
      lat
      lng
      eventLocationId
      agency
      status
      ownerId

      createdAt
      updatedAt
      terms {
        id
        name
        slug
      }
      primaryTerms {
        id
        name
        slug
      }
      events {
        id
        title
      }
      heroImage {
        id
        meta
        status
        alt
        credits
      }
    }
    adminUsers(roles: ["administrator", "editor", "contributor"]) {
      id
      firstName
      lastName
    }
    moduleTaxonomies(key: "location") {
      id
      name
      slug
      isRequired
      collectPrimaryTerm
      terms {
        id
        slug
        name
      }
    }
  }
`;

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);
  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    ModuleLocationUpdateSchema
  );

  const { data, loading, error } = useQuery(
    locationReadAndContentAuthorsQueryGQL,
    {
      variables: {
        id: parseInt(router.query.id, 10),
      },
    }
  );

  const [firstMutation, firstMutationResults] = useLocationUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.locationRead) return;

    let moduleTerms = {};

    if (data?.moduleTaxonomies) {

      console.log(data?.moduleTaxonomies);

      let requiredModules = data.moduleTaxonomies.reduce((acc: any, m: any) => {
        if (!m?.isRequired || !Array.isArray(m.terms) || m.terms.length === 0)
          return acc;

        const keys = m.terms.map((t: any) => `tax_${m.id}_${t.id}`);

        return {
          ...acc,
          ...keys.reduce(
            (acc: any, m: any) => ({
              ...acc,
              [m]: boolean(),
            }),
            {}
          ),
          [`tax_${m.id}`]: mixed().when(keys, {
            is: (...args: any[]) => {
              return !!args.find((a) => a);
            },
            then: boolean(),
            otherwise: number()
              .typeError("validation.array.minOneItem")
              .required(),
          }),
        };
      }, {});

      if (Object.keys(requiredModules).length > 0) {
        setExtendedValidationSchema(
          ModuleLocationUpdateSchema.concat(
            object().shape({
              // t("validation.array.minOneItem", "Please select at least one item")
              ...requiredModules,
            })
          )
        );
      }

      moduleTerms = data.moduleTaxonomies.reduce((acc: any, m: any) => {
        if (!Array.isArray(m.terms) || m.terms.length === 0)
          return acc;

        return {
          ...acc,
          ...mapDataToGroupOptions(data.locationRead.terms, m.terms, `tax_${m.id}` ),
        }
      }, {});      
    }

    console.log(moduleTerms);
    
    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.locationRead,
          ["ownerId", "lat", "lng", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages
      ),
      ...moduleTerms,
      ...mapDataToPrimaryTerms(
        data.locationRead.primaryTerms,
        data.moduleTaxonomies
      ),
      heroImage: data.locationRead.heroImage?.id,
      lat: data.locationRead?.lat,
      lng: data.locationRead?.lng,
      eventLocationId: data.locationRead?.eventLocationId
        ? parseInt(data.locationRead?.eventLocationId)
        : undefined,
      agency: data.locationRead?.agency,
      ...pick(data?.locationRead?.address, [
        "co",
        "street1",
        "street2",
        "houseNumber",
        "city",
        "postCode",
      ]),
      ...pick(data?.locationRead?.contactInfo, [
        "email1",
        "email2",
        "phone1",
        "phone2",
      ]),
      ...pick(data?.locationRead?.socialMedia, [
        "facebook",
        "twitter",
        "instagram",
        "youtube",
        "website",
      ]),
      ...multiLangImageTranslationsJsonRHFormData(
        data.locationRead,
        ["heroImage"],
        ["alt", "credits"],
        config.activeLanguages
      ),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const heroImage =
          newData.heroImage &&
          !isNaN(newData.heroImage) &&
          newData.heroImage > 0
            ? {
                heroImage: {
                  connect: {
                    id: newData.heroImage,
                  },
                },
              }
            : undefined;

        let terms = [];
        if (Array.isArray(data?.moduleTaxonomies)) {
          terms = data?.moduleTaxonomies.reduce((acc: any, module: any) => {
            if (Array.isArray(module.terms) && module.terms.length > 0) {
              return [
                ...acc,
                ...mapGroupOptionsToData(
                  newData,
                  module.terms,
                  `tax_${module.id}`
                ),
              ];
            }
            return acc;
          }, []);
        }

        const primaryTerms = mapPrimaryTermsToData(
          "set",
          newData,
          data?.moduleTaxonomies
        );

        if (primaryTerms?.primaryTerms?.set) {
          terms = primaryTerms?.primaryTerms?.set.reduce(
            (acc: any, term: any) => {
              if (!acc.find((t: any) => t.id === term.id))
                acc.push({
                  id: term.id,
                });
              return acc;
            },
            terms
          );
        }

        const { errors } = await firstMutation(
          parseInt(router.query.id, 10),
          {
            owner: {
              connect: {
                id: newData.ownerId,
              },
            },
            status: newData.status,
            lat: newData.lat,
            lng: newData.lng,
            eventLocationId: newData.eventLocationId
              ? parseInt(newData.eventLocationId)
              : undefined,
            agency: newData.agency,

            terms: {
              set: terms,
            },
            ...primaryTerms,
            address: pick(newData, [
              "co",
              "street1",
              "street2",
              "houseNumber",
              "city",
              "postCode",
            ]),
            contactInfo: pick(newData, [
              "email1",
              "email2",
              "phone1",
              "phone2",
            ]),
            socialMedia: pick(newData, [
              "facebook",
              "twitter",
              "instagram",
              "youtube",
              "website",
            ]),
            ...heroImage,
            ...filteredOutputByWhitelist(
              multiLangRHFormDataToJson(
                newData,
                multiLangFields,
                config.activeLanguages
              ),
              [],
              multiLangFields
            ),
          },
          multiLangImageTranslationsRHFormDataToJson(
            newData,
            [
              {
                name: "heroImage",
                id: newData.heroImage,
              },
            ],
            ["alt", "credits"],
            config.activeLanguages
          )
        );

        if (!errors) {
          successToast();
          reset(
            {},
            {
              keepValues: true,
              keepDefaultValues: true,
            }
          );
        } else {
          let slugError = multiLangSlugUniqueError(errors, setError);

          if (!slugError) setHasFormError(true);
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
      path: moduleRootPath,
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.location.title.updatepage", "Update location"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "locationRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "locationUpdate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={
          (isDirty && !isSubmitting && !isNavigatingAway) ||
          activeUploadCounter > 0
        }
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView hasFormError={hasFormError} />
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
              <ModuleForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={extendedValidationSchema}
              />

              {data && Array.isArray(data?.locationRead?.events) && (
                <Box mt="6">
                  <Divider mt="10" />
                  <Heading as="h2" mb="3">
                    {t(
                      "module.locations.associatedevents.title",
                      "Associated events"
                    )}
                  </Heading>
                  <Table position="relative" mb="400px" w="100%">
                    <Thead>
                      <tr>
                        <Th
                          pl="0"
                          borderColor="gray.300"
                          fontSize="md"
                          color="gray.800"
                        >
                          {t("module.locations.events.title", "Title")}
                        </Th>
                        <Th
                          textAlign="center"
                          px="0"
                          borderColor="gray.300"
                          fontSize="md"
                          color="gray.800"
                          _last={{
                            position: "sticky",
                            right: 0,
                            p: 0,
                            "> div": {
                              p: 4,
                              h: "100%",
                              bg: "rgba(255,255,255,0.9)",
                            },
                          }}
                        >
                          {t(
                            "module.locations.fields.label.actions",
                            "Actions"
                          )}
                        </Th>
                      </tr>
                    </Thead>
                    <tbody>
                      {data.locationRead.events.length === 0 && (
                        <tr key={`event-no-event`}>
                          <chakra.td pl="0" borderColor="gray.300" colSpan={2}>
                            {t(
                              "module.locations.noasscoiatedevents",
                              "No associated events"
                            )}
                          </chakra.td>
                        </tr>
                      )}
                      {data.locationRead.events.length > 0 && (
                        <>
                          {data.locationRead.events.map((event: any) => (
                            <tr key={`event-${event.id}`}>
                              <Td pl="0" borderColor="gray.300">
                                <MultiLangValue json={event.title} />
                              </Td>

                              <Td
                                px="0"
                                borderColor="gray.300"
                                _last={{
                                  position: "sticky",
                                  right: 0,
                                  p: 0,
                                  "> div": {
                                    p: 4,
                                    h: "100%",
                                    bg: "rgba(255,255,255,0.9)",
                                  },
                                }}
                              >
                                <Flex justifyContent="center">
                                  <HStack mx="auto">
                                    <IconButton
                                      variant="outline"
                                      as={RouterLink}
                                      to={`/events/update/${event.id}`}
                                      icon={<BsEye />}
                                      fontSize="lg"
                                      aria-label={t(
                                        "module.locations.fields.label.viewevent",
                                        "View event"
                                      )}
                                      title={t(
                                        "module.locations.fields.label.viewevent",
                                        "View event"
                                      )}
                                      disabled={
                                        !(appUser && appUser.can("eventUpdate"))
                                      }
                                    />
                                  </HStack>
                                </Flex>
                              </Td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </Table>
                </Box>
              )}
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
