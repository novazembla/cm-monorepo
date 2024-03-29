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
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";

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
  multiLangTranslationsJsonRHFormData,
  multiLangImageMetaRHFormDataToJson,
  getMultilangValue,
} from "~/utils";

export const pageAndContentAuthorsQueryGQL = gql`
  query page($id: Int!) {
    page(id: $id) {
      id
      title
      slug
      intro
      content
      metaDesc
      status
      ownerId

      heroImage {
        id
        meta
        status
        alt
        credits
        cropPosition
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
  const [appUser, { getPreviewUrl }] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(pageAndContentAuthorsQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = usePageUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModulePageUpdateSchema as any),
  });

  const {
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.page) return;

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.page,
          ["ownerId", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages
      ),
      heroImage: data.page.heroImage?.id,
      heroImage_cropPosition: data.page.heroImage?.cropPosition,
      ...multiLangTranslationsJsonRHFormData(
        data?.page?.heroImage,
        ["alt", "credits"],
        config.activeLanguages,
        "heroImage"
      ),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModulePageUpdateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    
    const pullAfterUpdate =
          data.status === PublishStatus.PUBLISHED ||
          newData.status === PublishStatus.PUBLISHED;

    const heroImage =
      newData.heroImage && !isNaN(newData.heroImage) && newData.heroImage > 0
        ? {
            heroImage: {
              connect: {
                id: newData.heroImage,
              },
              update: {
                cropPosition: newData.heroImage_cropPosition
                  ? parseInt(newData.heroImage_cropPosition)
                  : 0,
                ...multiLangImageMetaRHFormDataToJson(
                  newData,
                  "heroImage",
                  ["alt", "credits"],
                  config.activeLanguages
                ),
              },
            },
          }
        : undefined;

    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
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
        });

        if (!errors) {
          successToast();
          reset(
            {},
            {
              keepDirty: false,
              keepValues: true,
            }
          );
          if (pullAfterUpdate) {
            try {
              const urls = [
                `${config.frontendUrl}/seite/${newData.slug_de}`,
                `${config.frontendUrl}/en/page/${newData.slug_en}`,
                `${config.frontendUrl}/en/seite/${newData.slug_de}`,
                `${config.frontendUrl}/page/${newData.slug_en}`,
              ];
              await Promise.all(urls.map((url: string) => {
                return fetch(url, {
                  method: "GET"
                });
              }));
            } catch (err: any) {
              console.error(err);
            }
          }
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
      type: "link",
      href: getPreviewUrl(`/page/${getMultilangValue(data?.page?.slug)}`),
      label: t("module.button.preview", "Preview"),
      targetBlank: true,
      userCan: "pageReadOwn",
      isDisabled:
        !!error ||
        [
          PublishStatus.TRASHED,
          PublishStatus.DELETED,
        ].includes(parseInt(watch("status") ?? "0")),
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "pageUpdate",
      isDisabled: !!error,
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
