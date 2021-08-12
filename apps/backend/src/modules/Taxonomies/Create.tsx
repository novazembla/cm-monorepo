import { useState } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleTaxonomySchema } from "./forms";
import { useTaxonomyCreateMutation } from "./hooks";
import {
  useAuthentication,
  useSuccessfullySavedToast,
  useRouter,
  useConfig,
  useModules,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { TaxonomyForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";

import { mapModulesCheckboxSelectionToData } from "./helpers";

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const [firstMutation, firstMutationResults] = useTaxonomyCreateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const modules = useModules();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ModuleTaxonomySchema),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTaxonomySchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation({
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages
            ),
            [],
            multiLangFields
          ),
          modules: {
            connect: mapModulesCheckboxSelectionToData(newData, modules),
          },
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
      title: t("module.taxonomies.title", "Taxonomies"),
    },
    {
      title: t("module.taxonomies.page.title.createtax", "Add new taxonomy"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "taxRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.save", "Save"),
      userCan: "taxCreate",
    },
  ];

  return (
    <>
      <FormNavigationBlock shouldBlock={isDirty && !isSubmitting} />
      <FormProvider {...formMethods}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage>
              {isFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <TaxonomyForm
                type="taxonomy"
                action="create"
                validationSchema={ModuleTaxonomySchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
