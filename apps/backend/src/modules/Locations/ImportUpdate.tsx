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

import { ModuleImportUpdateSchema } from "./forms";
import { useImportUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";
import { Divider } from "@chakra-ui/react";
import { importReadQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { ModuleImportUpdateForm } from "./forms";

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(importReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useImportUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleImportUpdateSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.importRead) return;

    reset({
      title: data.importRead.title,
      status: parseInt(data.importRead.status),
      file: data.importRead.fileId,
      mapping: [], // TODO: ....
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleImportUpdateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          title: newData.title,
          status: newData.status,
          mapping: newData.mapping, // TODO: if file deleted status has to change ...
        });

        if (!errors) {
          successToast();
        } else {
          setHasFormError(true);
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
      path: `${moduleRootPath}/import`,
      title: t("module.locations.imports.title", "Imports"),
    },
    {
      title: t("module.locations.location.title.updatepage", "Update location"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/import`,
      label: t("module.button.cancel", "Cancel"),
      userCan: "locationRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "locationCreate",
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
              <ModuleImportUpdateForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModuleImportUpdateSchema}
                onUpload={(data: any, formFunctions: any) => {
                  if (data?.file?.id) {
                    formFunctions.clearErrors("file");
                    formFunctions.setValue("file", data?.file?.id, {
                      shouldDirty: false,
                    });
                    formFunctions.setUploadedFileId(data?.file?.id);
                  }
                }}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
