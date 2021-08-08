import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { BeatLoader } from "react-spinners";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleTaxonomySchema } from "./forms";
import { useTermUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import {
  filteredOutputByWhitelist,
  taxonomyReadQueryGQL,
  termReadQueryGQL,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { MultiLangValue } from "~/components/ui";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { TaxonomyForm } from "./forms";
import { multiLangJsonToRHFormData, multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";
;

const UpdateTerm = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const { data, loading, error } = useQuery(termReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTermUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);
  
  const taxonomyQueryResults = useQuery(taxonomyReadQueryGQL, {
    variables: {
      id: parseInt(router.query.taxId, 10)
    },
  });

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
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
    if (!data || !data.termRead) return;

    reset(
      multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.termRead, [], multiLangFields),
        multiLangFields,
        config.activeLanguages
      )
    );
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTaxonomySchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(
          parseInt(router.query.id, 10),
          filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages
            ),
            [],
            multiLangFields
          )
        );

        if (!errors) {
          successToast();

          router.push(`${moduleRootPath}/${parseInt(router.query.taxId, 10)}/terms`);
        } else {
          let slugError = multiLangSlugUniqueError(errors, setError);
          
          if (!slugError)
            setIsFormError(true);
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
      path: `${moduleRootPath}/${router.query.taxId}/terms`,
      title: taxonomyQueryResults.data && taxonomyQueryResults.data.taxonomyRead ? <MultiLangValue json={taxonomyQueryResults.data.taxonomyRead.name} /> : <BeatLoader size="10px" color="#666"/>,
    },
    {
      title: t("module.taxonomies.page.title.createtax", "Update term"),
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
              <TaxonomyForm
                action="update"
                data={data?.termRead}
                validationSchema={ModuleTaxonomySchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default UpdateTerm;
