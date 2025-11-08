import { useState, useEffect } from "react";
import type * as yup from "yup";
import { object, boolean, mixed, number } from "yup";
import pick from "lodash/pick";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleEventUpdateSchema } from "./forms";
import { useEventUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";

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
  multiLangImageMetaRHFormDataToJson,
  multiLangTranslationsJsonRHFormData,
  mapGroupOptionsToData,
  mapDataToGroupOptions,
  mapDataToPrimaryTerms,
  getMultilangValue,
} from "~/utils";

const eventAndContentAuthorsQueryGQL = gql`
  query event($id: Int!) {
    event(id: $id) {
      id
      title
      slug
      description
      metaDesc
      status
      address
      organiser
      isFree
      ticketFee
      isImported
      meta
      socialMedia
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
      dates {
        id
        date
        begin
        end
      }
      locations {
        id
        title
      }
      heroImage {
        id
        meta
        status
        alt
        credits
        cropPosition
      }
    }
    adminUsers(roles: ["administrator", "editor", "contributor"]) {
      id
      firstName
      lastName
    }
    moduleTaxonomies(key: "event") {
      id
      name
      collectPrimaryTerm
      isRequired
      terms {
        id
        name
      }
    }
  }
`;

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser, { getPreviewUrl }] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);
  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    ModuleEventUpdateSchema
  );

  const { data, loading, error } = useQuery(eventAndContentAuthorsQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });
  
  const [firstMutation, firstMutationResults] = useEventUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema as any),
    defaultValues: {
      dates: [],
      locationId: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const parseIncomingDates = (dates: any) => {
    if (!dates) return [];

    if (Array.isArray(dates))
      return dates.reduce((acc, date) => {
        try {
          acc.push({
            id: date.id,
            date: new Date(date.date),
            begin: new Date(date.begin),
            end: new Date(date.end),
          });
        } catch (err) {
          // do nothing
        }
        return acc;
      }, []);

    return [];
  };

  useEffect(() => {
    if (!data || !data.event) return;

    let moduleTerms = {};

    if (data?.moduleTaxonomies) {
      const requiredModules = data.moduleTaxonomies.reduce((acc: any, m: any) => {
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
          ModuleEventUpdateSchema.concat(
            object().shape({
              // t("validation.array.minOneItem", "Please select at least one item")
              ...requiredModules,
            })
          )
        );
      }

      moduleTerms = data.moduleTaxonomies.reduce((acc: any, m: any) => {
        if (!Array.isArray(m.terms) || m.terms.length === 0) return acc;

        return {
          ...acc,
          ...mapDataToGroupOptions(data.event.terms, m.terms, `tax_${m.id}`),
        };
      }, {});
    }

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.event,
          ["ownerId", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages ?? ["en"]
      ),
      ...moduleTerms,
      ...mapDataToPrimaryTerms(data.event.primaryTerms, data.moduleTaxonomies),
      address: data?.event.address ?? "",
      organiser: data?.event.organiser ?? "",
      isFree: !!data?.event?.isFree,
      ticketFee: data?.event?.ticketFee ?? "",
      isImported: !!data.event.isImported,
      date: new Date("12/20/2021"),
      dates: parseIncomingDates(data?.event?.dates),
      locationId:
        data?.event?.locations && data?.event?.locations.length
          ? data?.event?.locations[0].id
          : 0,
      heroImage: data.event.heroImage?.id,
      heroImage_cropPosition: data.event.heroImage?.cropPosition,
      ...multiLangTranslationsJsonRHFormData(
        data?.event?.heroImage,
        ["alt", "credits"],
        config.activeLanguages ?? ["en"],
        "heroImage"
      ),
      website: data?.event?.socialMedia?.website,
      facebook: data?.event?.socialMedia?.facebook,
      instagram: data?.event?.socialMedia?.instagram,
    });
  }, [reset, data, config.activeLanguages, setExtendedValidationSchema]);

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const pullAfterUpdate =
          data.status === PublishStatus.PUBLISHED ||
          newData.status === PublishStatus.PUBLISHED;

        const heroImage =
          newData.heroImage &&
          !isNaN(newData.heroImage) &&
          newData.heroImage > 0
            ? {
                heroImage: {
                  connect: {
                    id: newData.heroImage,
                  },
                  update: {
                    cropPosition: newData.heroImage_cropPosition
                      ? parseInt(newData.heroImage_cropPosition)
                      : 0,
                    ...multiLangImageMetaRHFormDataToJson(
                      newData,
                      "heroImage",
                      ["alt", "credits"],
                      config.activeLanguages
                    ),
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

        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          owner: {
            connect: {
              id: newData.ownerId,
            },
          },
          ...(newData.locationId
            ? {
                locations: {
                  set: {
                    id: newData.locationId,
                  },
                },
              }
            : {
                locations: {
                  set: [],
                },
              }),
          address: newData?.address ?? "",
          organiser: newData?.organiser ?? "",
          isFree: !!newData.isFree,
          ticketFee: newData?.ticketFee ?? "",
          isImported: !!newData.isImported,
          dates: newData.dates,
          status: newData.status,
          socialMedia: pick(newData, [
            "facebook",
            "instagram",
            "website",
          ]),
          terms: {
            set: terms,
          },
          ...heroImage,
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages ?? ["en"]
            ),
            [],
            multiLangFields
          ),
        });

        if (!errors) {
          successToast();
          reset(
            {},
            {
              keepDirty: false,
              keepValues: true,
            }
          );
          if (pullAfterUpdate) {
            try {
              const urls = [
                `${config.frontendUrl}/veranstaltung/${newData.slug_de}`,
                `${config.frontendUrl}/en/event/${newData.slug_en}`,
                `${config.frontendUrl}/en/veranstaltung/${newData.slug_de}`,
                `${config.frontendUrl}/event/${newData.slug_en}`,
                `${config.frontendUrl}/veranstaltungen`,
                `${config.frontendUrl}/events`,
                `${config.frontendUrl}`,
                `${config.frontendUrl}/en`,
              ];
              await Promise.all(urls.map((url: string) => {
                return fetch(url, {
                  method: "GET"
                });
              }));
            } catch (err: any) {
              console.error(err);
            }
          }
        } else {
          const slugError = multiLangSlugUniqueError(errors, setError);

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
      title: t("module.events.title", "Events"),
    },
    {
      title: t("module.events.event.title.updatepage", "Update event"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "eventRead",
    },
    {
      type: "link",
      href: getPreviewUrl(`/event/${getMultilangValue(data?.event?.slug)}`),
      label: t("module.button.preview", "Preview"),
      targetBlank: true,
      userCan: "pageReadOwn",
      isDisabled:
        !!error ||
        [
          PublishStatus.TRASHED,
          PublishStatus.DELETED,
        ].includes(parseInt(watch("status") ?? "0")),
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "eventUpdate",
      isDisabled: !!error,
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
              <ModuleForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={extendedValidationSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
