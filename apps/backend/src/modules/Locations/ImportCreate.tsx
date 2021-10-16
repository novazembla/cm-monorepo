import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ImportStatus } from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleImportCreateSchema } from "./forms";
import { useImportCreateMutation } from "./hooks";
import {
  useAuthentication,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { ModuleImportCreateForm } from "./forms";

const Create = () => {
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t, i18n } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useImportCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleImportCreateSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleImportCreateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const mutationResults = await firstMutation({
          status: ImportStatus.CREATED,
          title: newData.title,
          lang: i18n.language,
        });

        if (!mutationResults.errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(
            `${moduleRootPath}/import/${mutationResults.data?.importCreate?.id}`
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
      path: moduleRootPath,
      title: t("module.locations.title", "Locations"),
    },
    {
      path: `${moduleRootPath}/import`,
      title: t("module.locations.imports.title", "Imports"),
    },
    {
      title: t("module.locations.menuitem.createimport", "Add new import"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/import`,
      label: t("module.button.cancel", "Cancel"),
      userCan: "locationRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.savedraft", "Save draft"),
      userCan: "locationCreate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={!isNavigatingAway && isDirty && !isSubmitting}
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView hasFormError={hasFormError} />
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
              <ModuleImportCreateForm
                action="create"
                validationSchema={ModuleImportCreateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
