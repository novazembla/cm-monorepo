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
  dataImportReadQueryGQL,
  dataImportHeadersEvent,
  DataImportStatus,
  dataImportRequiredHeadersEvent,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, dataImportExportType } from "./moduleConfig";

import { ModuleImportUpdateForm } from "./forms";

const Update = () => {
  const router = useRouter();

  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(dataImportReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
      type: dataImportExportType,
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
    if (!data || !data.dataImportRead) return;

    let mappedValues = {};
    if (Array.isArray(data.dataImportRead.mapping))
      mappedValues = data.dataImportRead.mapping.reduce(
        (agg: any, mapping: any, index: number) => ({
          ...agg,
          [`mapping-col-${index}`]: mapping.match,
        }),
        {}
      );

    reset({
      type: dataImportExportType,
      title: data.dataImportRead.title,
      status: parseInt(data.dataImportRead.status),
      file: data.dataImportRead.fileId,
      mapping: data.dataImportRead.mapping,
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
          type: dataImportExportType,
          status: newData.status,
          mapping: newMapping,
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
      title: t("module.events.title", "Events"),
    },
    {
      path: `${moduleRootPath}/import`,
      title: t("module.locations.imports.menu.title", "Imports"),
    },
    {
      title: t("module.locations.imports.title.updatepage", "Update import"),
    },
  ];

  const mapping = watch("mapping");
  let canProcess = false;
  let allRequiredErrors: string[] = [];
  if (mapping && Array.isArray(mapping)) {
    const allSet = !mapping.find(
      (m) =>
        m.match === "" || !Object.keys(dataImportHeadersEvent).includes(m.match)
    );

    const matchedKeys = mapping.map((m) => m.match);

    const requiredHeadersCheck = Object.keys(
      dataImportRequiredHeadersEvent
    ).reduce((agg, rhKey) => {
      return {
        ...agg,
        [rhKey]: !!dataImportRequiredHeadersEvent[rhKey].find((key) =>
          matchedKeys.includes(key)
        ),
      };
    }, {} as any);

    Object.keys(requiredHeadersCheck).forEach((key) => {
      if (!requiredHeadersCheck[key]) {
        const keys = dataImportRequiredHeadersEvent[key].map((k) => {
          return dataImportHeadersEvent[k].en;
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
      isDisabled:
        !!error ||
        ![DataImportStatus.CREATED, DataImportStatus.ASSIGN].includes(
          data?.dataImportRead?.status
        ),
    },
    {
      type: "button",
      onClick: () => {
        setValue("status", DataImportStatus.PROCESS);
        handleSubmit(onSubmit)();
      },
      isLoading: isSubmitting,
      label: t("module.button.import", "Schedule import"),
      isDisabled:
        !!error ||
        !canProcess ||
        isDirty ||
        ![DataImportStatus.CREATED, DataImportStatus.ASSIGN].includes(
          data?.dataImportRead?.status
        ),
      userCan: "locationCreate",
    },
  ];

  const currentFileId = watch("file");

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

              {currentFileId && (
                <>
                  {data?.dataImportRead?.status === DataImportStatus.ASSIGN &&
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

                  {data?.dataImportRead?.status === DataImportStatus.ASSIGN &&
                    (!canProcess || isDirty) && (
                      <Alert borderRadius="lg" status="warning" mb="4">
                        <AlertIcon />
                        {t(
                          "module.locations.imports.assignColumnsToTriggerImport",
                          "To be able to schedule the import you need to assign all (required) columns"
                        )}
                      </Alert>
                    )}

                  {[
                    DataImportStatus.PROCESS,
                    DataImportStatus.PROCESSING,
                  ].includes(data?.dataImportRead?.status) && (
                    <Alert borderRadius="lg">
                      <AlertIcon />
                      {t(
                        "module.locations.imports.importIsProcessing",
                        "Your import is being processed on the server."
                      )}
                    </Alert>
                  )}
                </>
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
                      status: DataImportStatus.ASSIGN,
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
