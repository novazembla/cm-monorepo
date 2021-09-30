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

import { ModulePageCreateSchema } from "./forms";
import { usePageCreateMutation } from "./hooks";
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

import { PageForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = usePageCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModulePageCreateSchema),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModulePageCreateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { data, errors } = await firstMutation({
          owner: {
            connect: { id: appUser.id },
          },
          status: PublishStatus.DRAFT,
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
          setIsNavigatingAway(true);
          router.push(`${moduleRootPath}/update/${data?.pageCreate?.id}`);
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
      title: t("module.pages.title", "Pages"),
    },
    {
      title: t("module.pages.page.title.createpage", "Add new page"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "pageRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.savedraft", "Save draft"),
      userCan: "pageCreate",
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
              <PageForm
                action="create"
                validationSchema={ModulePageCreateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
