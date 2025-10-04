import { useState, useEffect } from "react";
import type * as yup from "yup";
import { object, boolean, mixed, number } from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";
import pick from "lodash/pick";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleLocationCreateSchema } from "./forms";
import { useLocationCreateMutation } from "./hooks";
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

import { ModuleForm } from "./forms";
import {
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  mapGroupOptionsToData,
  mapPrimaryTermsToData
} from "~/utils";

const locationGetTaxonomies = gql`
  query moduleTaxonomies {
    moduleTaxonomies(key: "location") {
      id
      name
      slug
      isRequired
      collectPrimaryTerm
      terms {
        id
        slug
        name
      }
    }
  }
`;

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useLocationCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);
  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    ModuleLocationCreateSchema
  );

  const disableForm = firstMutationResults.loading;

  const { data, loading, error } = useQuery(locationGetTaxonomies, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  useEffect(() => {
    if (!data || !Array.isArray(data.moduleTaxonomies)) return;

    const requiredModules = data.moduleTaxonomies.reduce((acc: any, m: any) => {
      if (!m?.isRequired || !Array.isArray(m.terms) || m.terms.length === 0)
        return acc;

      const keys = m.terms.map((t: any) => `tax_${m.id}_${t.id}`);

      return {
        ...acc,
        ...keys.reduce(
          (acc: any, m: any) => ({
            ...acc,
            [m]: boolean(),
          }),
          {}
        ),
        [`tax_${m.id}`]: mixed().when(keys, {
          is: (...args: any[]) => {
            return !!args.find((a) => a);
          },
          then: boolean(),
          otherwise: number()
            .typeError("validation.array.minOneItem")
            .required(),
        }),
      };
    }, {});

    if (Object.keys(requiredModules).length > 0) {
      setExtendedValidationSchema(
        ModuleLocationCreateSchema.concat(
          object().shape({
            // t("validation.array.minOneItem", "Please select at least one item")
            ...requiredModules,
          })
        )
      );
    }
  }, [data, setExtendedValidationSchema]);

  const formMethods = useForm<any>({
    mode: "onTouched",
    defaultValues: {
      city: config.defaultCity,
    },
    resolver: yupResolver(extendedValidationSchema as any),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        let terms = [];
        if (Array.isArray(data?.moduleTaxonomies)) {
          terms = data?.moduleTaxonomies.reduce((acc: any, module: any) => {
            if (Array.isArray(module.terms) && module.terms.length > 0) {
              return [
                ...acc,
                ...mapGroupOptionsToData(
                  newData,
                  module.terms,
                  `tax_${module.id}`
                ),
              ];
            }
            return acc;
          }, []);
        }

        const primaryTerms = mapPrimaryTermsToData(
          "connect",
          newData,
          data?.moduleTaxonomies
        );

        if (primaryTerms?.primaryTerms?.connect) {
          terms = primaryTerms?.primaryTerms?.connect.reduce(
            (acc: any, term: any) => {
              if (!acc.find((t: any) => t.id === term.id))
                acc.push({
                  id: term.id,
                });
              return acc;
            },
            terms
          );
        }

        const mutationResults = await firstMutation({
          owner: {
            connect: {
              id: appUser.id,
            },
          },
          lat: newData.lat,
          lng: newData.lng,
          status: PublishStatus.DRAFT,
          eventLocationId: newData.eventLocationId
            ? parseInt(newData.eventLocationId)
            : undefined,
          agency: newData.agency,
          terms: {
            connect: terms,
          },
          ...primaryTerms,
          address: pick(newData, [
            "co",
            "street1",
            "street2",
            "houseNumber",
            "city",
            "postCode",
          ]),
          contactInfo: pick(newData, ["email1", "email2", "phone1", "phone2"]),
          socialMedia: pick(newData, [
            "facebook",
            "twitter",
            "instagram",
            "youtube",
            "website",
          ]),
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

        if (!mutationResults.errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(
            `${moduleRootPath}/update/${mutationResults.data?.locationCreate?.id}`
          );
        } else {
          const slugError = multiLangSlugUniqueError(
            mutationResults.errors,
            setError
          );

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
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.menuitem.createlocation", "Add new location"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
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
            <ModulePage isLoading={loading} isError={!!error}>
              {hasFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <ModuleForm
                action="create"
                data={data}
                validationSchema={extendedValidationSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
