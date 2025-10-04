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

import { ModuleEventCreateSchema } from "./forms";
import { useEventCreateMutation } from "./hooks";
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
} from "~/utils";

export const eventGetTaxonomies = gql`
  query event {
    moduleTaxonomies(key: "event") {
      id
      name
      collectPrimaryTerm
      isRequired
      terms {
        id
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

  const [firstMutation, firstMutationResults] = useEventCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    ModuleEventCreateSchema
  );

  const disableForm = firstMutationResults.loading;

  const { data, loading, error } = useQuery(eventGetTaxonomies, {
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
        ModuleEventCreateSchema.concat(
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
    resolver: yupResolver(extendedValidationSchema as any),
    defaultValues: {
      dates: [
        {
          date: new Date(),
          begin: new Date(new Date().setHours(10, 0, 0)),
          end: new Date(new Date().setHours(18, 0, 0)),
        },
      ],
    },
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

    let terms = [];
    if (Array.isArray(data?.moduleTaxonomies)) {
      terms = data?.moduleTaxonomies.reduce((acc: any, module: any) => {
        if (Array.isArray(module.terms) && module.terms.length > 0) {
          return [
            ...acc,
            ...mapGroupOptionsToData(newData, module.terms, `tax_${module.id}`),
          ];
        }
        return acc;
      }, []);
    }

    try {
      if (appUser) {
        const postData = {
          owner: {
            connect: {
              id: appUser.id,
            },
          },
          ...(newData.locationId
            ? {
                locations: {
                  connect: {
                    id: newData.locationId,
                  },
                },
              }
            : {}),
          dates: {
            create: newData.dates,
          },
          address: newData?.address ?? "",
          organiser: newData?.organiser ?? "",
          isFree: !!newData.isFree,
          isImported: false,
          lat: newData.lat,
          lng: newData.lng,
          status: PublishStatus.DRAFT,
          terms: {
            connect: terms,
          },
          socialMedia: pick(newData, [
            "facebook",
            "instagram",
            "website",
          ]),
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages ?? ["en"]
            ),
            [],
            multiLangFields
          ),
        };
        
        postData.slug.en = `${postData.slug.de}-en`;

        const mutationResults = await firstMutation(postData);

        if (!mutationResults.errors) {
          successToast();

          setIsNavigatingAway(true);
          router.push(
            `${moduleRootPath}/update/${mutationResults.data?.eventCreate?.id}`
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
      title: t("module.events.title", "Events"),
    },
    {
      title: t("module.events.menuitem.createevent", "Add new event"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "eventRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.savedraft", "Save draft"),
      userCan: "eventCreate",
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
