import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { BeatLoader } from "react-spinners";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleTermSchema } from "./forms";
import { useTermUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist, termReadQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { MultiLangValue } from "~/components/ui";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { TaxonomyForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
} from "~/utils";
const UpdateTerm = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const { data, loading, error } = useQuery(termReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTermUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTermSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.termRead) return;

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.termRead, [], multiLangFields),
        multiLangFields,
        config.activeLanguages
      ),
      color: data?.termRead?.color ?? "",
      colorDark: data?.termRead?.colorDark ?? "",
      hasColor: !!data?.termRead?.taxonomy?.hasColor,
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (newData: yup.InferType<typeof ModuleTermSchema>) => {
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
          color: newData.color,
          colorDark: newData.colorDark,
        });

        if (!errors) {
          successToast();
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
      path: `${moduleRootPath}/${router.query.taxId}/terms`,
      title:
        data && data?.termRead?.taxonomy ? (
          <MultiLangValue json={data?.termRead?.taxonomy.name} />
        ) : (
          <BeatLoader size="10px" color="#666" />
        ),
    },
    {
      title: t("module.taxonomies.page.title.updatetax", "Update term"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/${parseInt(router.query.taxId, 10)}/terms`,
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
                type="term"
                action="update"
                data={data?.termRead}
                validationSchema={ModuleTermSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default UpdateTerm;
