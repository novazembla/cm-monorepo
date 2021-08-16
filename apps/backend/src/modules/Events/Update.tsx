import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleEventValidationSchema } from "./forms";
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
} from "~/utils";

import { mapModulesCheckboxArrayToData, mapDataToModulesCheckboxArray } from "./helpers";

export const eventReadAndContentAuthorsQueryGQL = gql`
  query eventRead($id: Int!) {
    eventRead(id: $id) {
      id
      title
      slug
      description
      eventLocation
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

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ModuleEventValidationSchema),
    defaultValues: {
      dates: []
    }
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  
  const parseIncomingDates = (dates: any) => {
    if (!dates)
      return [];

    if (Array.isArray(dates))
      return dates.reduce((acc, date) => {
        try {
          acc.push({
            id: date.id,
            date: new Date(date.date),
            begin: new Date(date.begin), 
            end: new Date(date.end)
          })
        } catch (err) {}
        return acc;
      }, [])
    
    return [];
  }

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
        config.activeLanguages
      ),
      ...mapDataToModulesCheckboxArray(data.eventRead.terms, data.moduleTaxonomies),
      date: new Date("12/20/2021"),
      dates: parseIncomingDates(data?.eventRead?.dates),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleEventValidationSchema>
  ) => {
    setIsFormError(false);

    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          owner: {
            connect: {
              id: newData.ownerId,
            },
          },
          dates: newData.dates,
          status: newData.status,
          terms: {
            set: mapModulesCheckboxArrayToData(
              newData,
              data?.moduleTaxonomies
            ),
          },
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages
            ),
            [],
            multiLangFields
          ),
        });

        if (!errors) {
          successToast();

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
      <FormNavigationBlock shouldBlock={isDirty && !isSubmitting} />
      <FormProvider {...formMethods}>
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
                validationSchema={ModuleEventValidationSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
