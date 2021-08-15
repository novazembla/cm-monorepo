import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleEventValidationSchema } from "./forms";
import { useEventCreateMutation } from "./hooks";
import {
  useAuthentication,
  useSuccessfullySavedToast,
  useRouter,
  useConfig,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { ModuleForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";
import { mapModulesCheckboxArrayToData } from "./helpers";

export const eventReadGetTaxonomies = gql`
  query eventRead {
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

// TAX NOT REQUIRED EVEN THOUGH IT IS REQUIRED, why? TODO:

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const [firstMutation, firstMutationResults] = useEventCreateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ModuleEventValidationSchema),
    defaultValues: {
      dates: [
        {
          date: new Date(),
          begin: new Date(new Date().setHours(10, 0)),
          end: new Date(new Date().setHours(18)),
        },
      ],
    },
  });

  const { data, loading, error } = useQuery(eventReadGetTaxonomies, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleEventValidationSchema>
  ) => {
    console.log(newData);

    setIsFormError(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation({
          owner: {
            connect: {
              id: appUser.id,
            },
          },
          dates: {
            create: newData.dates,
          },
          lat: newData.lat,
          lng: newData.lng,
          status: PublishStatus.DRAFT,
          terms: {
            connect: mapModulesCheckboxArrayToData(
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
      title: t("module.events.mneuitem.createevent", "Add new event"),
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
      label: t("module.button.save", "Save"),
      userCan: "eventCreate",
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
                action="create"
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
export default Create;
