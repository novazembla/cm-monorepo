import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleTourSchemaCreate } from "./forms";
import { useTourCreateMutation } from "./hooks";
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

import { moduleRootPath, multiLangFieldsTour } from "./moduleConfig";

import { TourForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useTourCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourSchemaCreate as any),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTourSchemaCreate>
  ) => {
    setHasFormError(false);
    try {
      if (appUser) {
        const { data, errors } = await firstMutation({
          owner: {
            connect: { id: appUser.id },
          },
          status: PublishStatus.DRAFT,
          orderNumber: newData.orderNumber,
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFieldsTour,
              config.activeLanguages
            ),
            [],
            multiLangFieldsTour
          ),
          path: {}          
        });

        if (!errors && data?.tourCreate?.id) {
          successToast();
          setIsNavigatingAway(true);
          router.push(`${moduleRootPath}/update/${data?.tourCreate?.id}/`);
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
      title: t("module.tours.title", "Tours"),
    },
    {
      title: t("module.tours.page.title.createtax", "Add new tour"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "tourRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.save", "Save"),
      userCan: "tourCreate",
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
            <ModulePage>
              {hasFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <TourForm
                action="create"
                validationSchema={ModuleTourSchemaCreate}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
