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
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";
import { Divider, Alert, AlertIcon } from "@chakra-ui/react";
import {
  importReadQueryGQL,
  importHeaders,
  ImportStatus,
  importRequiredHeaders,
} from "@culturemap/core";

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
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.importRead) return;

    let mappedValues = {};
    if (Array.isArray(data.importRead.mapping))
      mappedValues = data.importRead.mapping.reduce(
        (agg: any, mapping: any, index: number) => ({
          ...agg,
          [`mapping-col-${index}`]: mapping.match,
        }),
        {}
      );

    reset({
      title: data.importRead.title,
      status: parseInt(data.importRead.status),
      file: data.importRead.fileId,
      mapping: data.importRead.mapping,
      ...mappedValues,
    });
  }, [reset, data]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleImportUpdateSchema>
  ) => {
    let newMapping = {};
    if (Array.isArray(newData.mapping))
      newMapping = (newData.mapping as any[]).map(
        (mapping: any, index: number) => ({
          ...mapping,
          match: getValues(`mapping-col-${index}`),
        })
      );

    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          title: newData.title,
          status: newData.status,
          mapping: newMapping,
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

  const mapping = watch("mapping");
  let canProcess = false;
  let allRequiredErrors: string[] = [];
  if (mapping && Array.isArray(mapping)) {
    const allSet = !mapping.find(
      (m) => m.match === "" || !Object.keys(importHeaders).includes(m.match)
    );

    const matchedKeys = mapping.map((m) => m.match);

    const requiredHeadersCheck = Object.keys(importRequiredHeaders).reduce(
      (agg, rhKey) => {
        return {
          ...agg,
          [rhKey]: !!importRequiredHeaders[rhKey].find((key) =>
            matchedKeys.includes(key)
          ),
        };
      },
      {} as any
    );

    Object.keys(requiredHeadersCheck).forEach((key) => {
      if (!requiredHeadersCheck[key]) {
        const keys = importRequiredHeaders[key].map((k) => {
          return importHeaders[k].en;
        });
        allRequiredErrors.push(`"${keys.join('" or "')}"`);
      }
    });

    canProcess = allSet && allRequiredErrors.length === 0;
  }
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
      isDisabled: ![ImportStatus.CREATED, ImportStatus.ASSIGN].includes(
        data?.importRead?.status
      ),
    },
    {
      type: "button",
      onClick: () => {
        setValue("status", ImportStatus.PROCESS);
        handleSubmit(onSubmit)();
      },
      isLoading: isSubmitting,
      label: t("module.button.import", "Schedule import"),
      isDisabled:
        !canProcess ||
        isDirty ||
        ![ImportStatus.CREATED, ImportStatus.ASSIGN].includes(
          data?.importRead?.status
        ),
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
              {data?.importRead?.status === ImportStatus.ASSIGN &&
                allRequiredErrors.length > 0 && (
                  <Alert borderRadius="lg" status="error" mb="4">
                    <AlertIcon />
                    {t(
                      "module.locations.imports.requiredMissing",
                      "The following required columns are not assigned: "
                    )}
                    {allRequiredErrors.join(", ")}
                  </Alert>
                )}

              {data?.importRead?.status === ImportStatus.ASSIGN &&
                (!canProcess || isDirty) && (
                  <Alert borderRadius="lg" status="warning" mb="4">
                    <AlertIcon />
                    {t(
                      "module.locations.imports.assignColumnsToTriggerImport",
                      "To be able to schedule the import you need to assign all (required) columns"
                    )}
                  </Alert>
                )}

              {[ImportStatus.PROCESS, ImportStatus.PROCESSING].includes(
                data?.importRead?.status
              ) && (
                <Alert borderRadius="lg">
                  <AlertIcon />
                  {t(
                    "module.locations.imports.importIsProcessing",
                    "Your import is being processed on the server."
                  )}
                </Alert>
              )}
              <ModuleImportUpdateForm
                action="update"
                data={data}
                isSubmitting={isSubmitting}
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

                  const hasErrors =
                    Array.isArray(data?.initialParseResult?.errors) &&
                    data?.initialParseResult?.errors?.length > 0;

                  if (data?.initialParseResult?.mapping && !hasErrors) {
                    reset({
                      status: ImportStatus.ASSIGN,
                      title: getValues("title"),
                      file: getValues("file"),
                      mapping: data?.initialParseResult?.mapping,
                      ...data?.initialParseResult?.mapping.reduce(
                        (agg: any, col: any, index: number) => ({
                          ...agg,
                          [`mapping-col-${index}`]:
                            col.match.indexOf("unknown-") === -1
                              ? col.match
                              : undefined,
                        }),
                        {} as any
                      ),
                    });

                    setValue("mapping-col-0", "title-de");
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
