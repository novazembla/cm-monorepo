import { useState, useEffect } from "react";
import type * as yup from "yup";
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
} from "~/utils";

import {
  mapModulesCheckboxArrayToData,
  mapDataToModulesCheckboxArray,
} from "./helpers";

// TODO
export const eventReadAndContentAuthorsQueryGQL = gql`
  query eventRead($id: Int!) {
    eventRead(id: $id) {
      id
      title
      slug
      description
      descriptionLocation
      status
      ownerId
      createdAt
      updatedAt
      terms {
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
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(
    eventReadAndContentAuthorsQueryGQL,
    {
      variables: {
        id: parseInt(router.query.id, 10),
      },
    }
  );

  const [firstMutation, firstMutationResults] = useEventUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleEventUpdateSchema),
    defaultValues: {
      dates: [],
    },
  });

  const {
    handleSubmit,
    reset,
    setError,
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
        } catch (err) {}
        return acc;
      }, []);

    return [];
  };

  useEffect(() => {
    if (!data || !data.eventRead) return;

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.eventRead,
          ["ownerId", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages ?? ["en"]
      ),
      ...mapDataToModulesCheckboxArray(
        data.eventRead.terms,
        data.moduleTaxonomies
      ),
      date: new Date("12/20/2021"),
      dates: parseIncomingDates(data?.eventRead?.dates),
      locationId:
        data?.eventRead?.locations && data?.eventRead?.locations.length
          ? data?.eventRead?.locations[0].id
          : undefined,
      heroImage: data.eventRead.heroImage?.id,
      ...multiLangImageTranslationsJsonRHFormData(
        data.eventRead,
        ["heroImage"],
        ["alt", "credits"],
        config.activeLanguages ?? ["en"]
      ),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleEventUpdateSchema>
  ) => {
    setIsFormError(false);
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

        const { errors } = await firstMutation(
          parseInt(router.query.id, 10),
          {
            owner: {
              connect: {
                id: newData.ownerId,
              },
            },
            locations: {
              set: [
                {
                  id: newData.locationId,
                },
              ],
            },
            dates: newData.dates,
            status: newData.status,
            terms: {
              set: mapModulesCheckboxArrayToData(
                newData,
                data?.moduleTaxonomies
              ),
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
            config.activeLanguages ?? ["en"]
          )
        );

        if (!errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(moduleRootPath);
        } else {
          let slugError = multiLangSlugUniqueError(errors, setError);

          if (!slugError) setIsFormError(true);
        }
      } else {
        setIsFormError(true);
      }
    } catch (err) {
      setIsFormError(true);
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
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "eventUpdate",
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
              {isFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <ModuleForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModuleEventUpdateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
