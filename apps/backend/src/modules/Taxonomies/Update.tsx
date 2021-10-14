import { useState, useEffect } from "react";
import type * as yup from "yup";
import { object, boolean, mixed, number } from "yup";

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
  mapGroupOptionsToData,
  mapDataToGroupOptions,
} from "~/utils";

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
  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(ModuleTaxonomySchema);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.taxonomyRead) return;

    const activeModules = Object.keys(modules).reduce((acc: any, k: string) => {
      if (modules[k].withTaxonomies) acc.push(modules[k]);
      return acc;
    }, []);

    const moduleKeys = activeModules.map((m: any) => `modules_${m.id}`);

    if (moduleKeys.length) {
      setExtendedValidationSchema(
        ModuleTaxonomySchema.concat(
          object().shape({
            // t("validation.array.minOneItem", "Please select at least one item")
  
            ...moduleKeys.reduce(
              (acc: any, m: any) => ({
                ...acc,
                [m]: boolean(),
              }),
              {}
            ),
  
            modules: mixed().when(moduleKeys, {
              is: (...args: any[]) => {
                return !!args.find((a) => a);
              },
              then: boolean(),
              otherwise: number()
                .typeError("validation.array.minOneItem")
                .required(),
            }),
          })
        )
      );  
    }
    
    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.taxonomyRead, [], multiLangFields),
        multiLangFields,
        config.activeLanguages
      ),
      hasColor: !!data.taxonomyRead.hasColor,
      collectPrimaryTerm: !!data.taxonomyRead.collectPrimaryTerm,
      isRequired: !!data.taxonomyRead.isRequired,
      modules: false,
      ...mapDataToGroupOptions(
        data?.taxonomyRead?.modules,
        activeModules,
        "modules"
      ),
    });
  }, [
    reset,
    data,
    config.activeLanguages,
    modules,
    setExtendedValidationSchema,
  ]);

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
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
          hasColor: !!newData.hasColor,
          collectPrimaryTerm: !!newData.collectPrimaryTerm,
          isRequired: !!newData.isRequired,
          modules: {
            set: mapGroupOptionsToData(
              newData,
              Object.keys(modules).reduce((acc: any, k: string) => {
                if (modules[k].withTaxonomies) acc.push(modules[k]);
                return acc;
              }, []),
              "modules"
            ),
          },
        });

        if (!errors) {
          successToast();
          reset(
            {},
            {
              keepDirty: false,
              keepValues: true
            }
          );
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
                validationSchema={extendedValidationSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
