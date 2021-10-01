import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { BeatLoader } from "react-spinners";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleTourStopSchema } from "./forms";

import { useTourStopUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist, tourStopReadQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { MultiLangValue } from "~/components/ui";

import { moduleRootPath, multiLangFieldsTourStop } from "./moduleConfig";

import { TourStopForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
} from "~/utils";
const UpdateTourStop = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const { data, loading, error } = useQuery(tourStopReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTourStopUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourStopSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.tourStopRead) return;

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.tourStopRead, [], multiLangFieldsTourStop),
        multiLangFieldsTourStop,
        config.activeLanguages
      ),
      color: data?.tourStopRead?.color ?? "",
      colorDark: data?.tourStopRead?.colorDark ?? "",
      hasColor: !!data?.tourStopRead?.tour?.hasColor,
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (newData: yup.InferType<typeof ModuleTourStopSchema>) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFieldsTourStop,
              config.activeLanguages
            ),
            [],
            multiLangFieldsTourStop
          ),
          color: newData.color,
          colorDark: newData.colorDark,
        });

        if (!errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(
            `${moduleRootPath}/update/${parseInt(router.query.tourId, 10)}/`
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
      title: t("module.tours.title", "Tours"),
    },
    {
      path: `${moduleRootPath}/update/${parseInt(router.query.tourId, 10)}`,
      title:
        data && data?.tourStopRead?.tour ? (
          <MultiLangValue json={data?.tourStopRead?.tour.title} />
        ) : (
          <BeatLoader size="10px" color="#666" />
        ),
    },
    {
      title: t("module.tours.page.title.updateTourStop", "Update tour stop"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/update/${parseInt(router.query.tourId, 10)}`,
      label: t("module.button.cancel", "Cancel"),
      userCan: "tourRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "tourUpdate",
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
              <TourStopForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModuleTourStopSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default UpdateTourStop;
