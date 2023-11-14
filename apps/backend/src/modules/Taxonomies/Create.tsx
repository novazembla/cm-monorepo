import { useState } from "react";
import type * as yup from "yup";
import { object, boolean, mixed, number } from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist } from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

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
import { multiLangRHFormDataToJson, multiLangSlugUniqueError, mapGroupOptionsToData } from "~/utils";

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useTaxonomyCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);
  
  const modules = useModules();

  const disableForm = firstMutationResults.loading;

  const activeModules = Object.keys(modules).reduce((acc: any, k: string) => {
    if (modules[k].withTaxonomies) acc.push(modules[k]);
    return acc;
  }, []);

  const moduleKeys = activeModules.map((m: any) => `modules_${m.id}`);

  const ExtendedModuleTaxonomySchema = ModuleTaxonomySchema.concat(
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
        otherwise: number().typeError("validation.array.minOneItem").required("validation.array.minOneItem"),
      }),
    })
  );

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ExtendedModuleTaxonomySchema as any),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ExtendedModuleTaxonomySchema>
  ) => {
    setHasFormError(false);
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
          hasIcons: newData.hasIcons,
          hasStolperstein: newData.hasStolperstein,
          hasColor: newData.hasColor,
          collectPrimaryTerm: newData.collectPrimaryTerm,
          isRequired: newData.isRequired,
          modules: {
            connect: mapGroupOptionsToData(
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
              <TaxonomyForm
                type="taxonomy"
                action="create"
                validationSchema={ExtendedModuleTaxonomySchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
