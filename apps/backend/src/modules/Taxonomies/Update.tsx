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

import { ModuleTaxonomySchema } from "./forms";
import { useTaxonomyUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
  useModules,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import {
  filteredOutputByWhitelist,
  taxonomyReadQueryGQL,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { TaxonomyForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
} from "~/utils";

import { mapModulesCheckboxSelectionToData } from "./helpers";

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const modules = useModules();

  const { data, loading, error } = useQuery(taxonomyReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTaxonomyUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTaxonomySchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.taxonomyRead) return;

    const currentModuleSelection = Object.keys(modules).reduce((acc, key) => {
      if (!modules[key].withTaxonomies) return acc;

      let flag;
      if (
        !data.taxonomyRead?.modules ||
        data.taxonomyRead?.modules.length === 0
      ) {
        flag = false;
      } else {
        flag =
          data.taxonomyRead?.modules.findIndex((m: any) => m.key === key) > -1;
      }

      acc.push(flag);
      return acc;
    }, [] as boolean[]);

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.taxonomyRead, [], multiLangFields),
        multiLangFields,
        config.activeLanguages
      ),
      modules: currentModuleSelection,
    });
  }, [reset, data, config.activeLanguages, modules]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTaxonomySchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
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
            set: mapModulesCheckboxSelectionToData(newData, modules),
          },
        });

        if (!errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(moduleRootPath);
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
      title: t("module.taxonomies.title", "Taxonomies"),
    },
    {
      title: t(
        "module.taxonomies.page.title.updatetaxonomy",
        "Update taxonomy"
      ),
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
      label: t("module.button.update", "Update"),
      userCan: "taxUpdate",
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
              <TaxonomyForm
                type="taxonomy"
                action="update"
                data={data?.taxonomyRead}
                validationSchema={ModuleTaxonomySchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
