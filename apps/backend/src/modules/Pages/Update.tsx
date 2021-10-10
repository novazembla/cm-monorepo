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

import { ModulePageUpdateSchema } from "./forms";
import { usePageUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { PageForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  multiLangImageTranslationsRHFormDataToJson,
  multiLangImageTranslationsJsonRHFormData,
} from "~/utils";

export const pageReadAndContentAuthorsQueryGQL = gql`
  query pageRead($id: Int!) {
    pageRead(id: $id) {
      id
      title
      slug
      intro
      content
      status
      ownerId

      heroImage {
        id
        meta
        status
        alt
        credits
      }
      createdAt
      updatedAt
    }
    adminUsers(roles: ["administrator", "editor", "contributor"]) {
      id
      firstName
      lastName
    }
  }
`;

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(pageReadAndContentAuthorsQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = usePageUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModulePageUpdateSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.pageRead) return;

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.pageRead,
          ["ownerId", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages
      ),
      heroImage: data.pageRead.heroImage?.id,
      ...multiLangImageTranslationsJsonRHFormData(
        data.pageRead,
        ["heroImage"],
        ["alt", "credits"],
        config.activeLanguages
      ),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModulePageUpdateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    const heroImage =
      newData.heroImage && !isNaN(newData.heroImage) && newData.heroImage > 0
        ? {
            heroImage: {
              connect: {
                id: newData.heroImage,
              },
            },
          }
        : undefined;

    try {
      if (appUser) {
        const { errors } = await firstMutation(
          parseInt(router.query.id, 10),
          {
            status: newData.status,
            ...filteredOutputByWhitelist(
              multiLangRHFormDataToJson(
                newData,
                multiLangFields,
                config.activeLanguages
              ),
              [],
              multiLangFields
            ),
            ...heroImage,
            owner: {
              connect: {
                id: newData.ownerId,
              },
            },
          },
          multiLangImageTranslationsRHFormDataToJson(
            newData,
            [
              {
                name: "heroImage",
                id: newData.heroImage,
              },
            ],
            ["alt", "credits"],
            config.activeLanguages
          )
        );

        if (!errors) {
          successToast();
          reset({
            keepValues: true, 
            keepDefaultValus: true
          });
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
      title: t("module.pages.title", "Pages"),
    },
    {
      title: t("module.pages.page.title.updatepage", "Update page"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "pageRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "pageUpdate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={
          (isDirty && !isSubmitting && !isNavigatingAway) ||
          activeUploadCounter > 0
        }
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
              <PageForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModulePageUpdateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
