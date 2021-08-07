import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleTaxonomySchema } from "./forms";
import { useTaxonomyUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import {
  taxonomyReadQueryGQL,
  filteredOutputByWhitelist,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { TaxonomyForm } from "./forms";

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const { data, loading, error } = useQuery(taxonomyReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTaxonomyUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ModuleTaxonomySchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data)
      return;
    
    const resetData = config.activeLanguages.reduce(
      (acc, lang) => {
        if (!data?.taxonomyRead)
          return acc;

        if (data.taxonomyRead.name)
          acc = {
            ...acc, 
            [`name_${lang}`]: data.taxonomyRead?.name[lang] ?? ""
          }

        if (data.taxonomyRead.slug)
          acc = {
            ...acc, 
            [`slug_${lang}`]: data.taxonomyRead?.slug[lang] ?? ""
          }

        return acc;
      },
      {}
    );

    reset(resetData);
  }, [reset, data, config.activeLanguages]);


  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTaxonomySchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const mutationData = config.activeLanguages.reduce(
          (acc, lang) => {
            if (newData[`name_${lang}`])
              acc.name = {
                ...acc.name,
                [lang]: newData[`name_${lang}`],
              };

            if (newData[`slug_${lang}`])
              acc.slug = {
                ...acc.slug,
                [lang]: newData[`slug_${lang}`],
              };

            return acc;
          },
          {
            name: {},
            slug: {},
          }
        );

        const { errors } = await firstMutation(parseInt(router.query.id, 10), mutationData);

        if (!errors) {
          
          successToast();

          router.push(moduleRootPath);
          
        } else {
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
      title: t("module.taxonomies.page.title.updatetaxonomy", "Update user"),
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
              <TaxonomyForm action="update" data={data?.taxonomyRead} validationSchema={ModuleTaxonomySchema} />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
