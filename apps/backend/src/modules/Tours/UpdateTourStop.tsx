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

import { ModuleTourStopUpdateSchema } from "./forms";

import { useTourStopUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import {
  filteredOutputByWhitelist,
  tourStopReadQueryGQL,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { MultiLangValue } from "~/components/ui";

import { moduleRootPath, multiLangFieldsTourStop } from "./moduleConfig";

import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  fieldImagesRFHFormDataToData,
  fieldImagesParseIncomingImages,
  multiLangImageMetaRHFormDataToJson,
  multiLangTranslationsJsonRHFormData,
} from "~/utils";

import { TourStopForm } from "./forms";

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
      id: parseInt(router.query.tourStopId, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTourStopUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourStopUpdateSchema),
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
        filteredOutputByWhitelist(
          data.tourStopRead,
          [],
          multiLangFieldsTourStop
        ),
        multiLangFieldsTourStop,
        config.activeLanguages
      ),
      locationId: data.tourStopRead?.location?.id,
      tourId: data.tourStopRead?.tourId,
      images: fieldImagesParseIncomingImages(data.tourStopRead.images),
      heroImage: data?.tourStopRead?.heroImage?.id,
      heroImage_cropPosition: data.tourStopRead.heroImage?.cropPosition,
      ...multiLangTranslationsJsonRHFormData(
        data?.tourStopRead?.heroImage,
        ["alt", "credits"],
        config.activeLanguages,
        "heroImage"
      ),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTourStopUpdateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const heroImage =
          newData.heroImage &&
          !isNaN(newData.heroImage) &&
          newData.heroImage > 0
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

        const { errors } = await firstMutation(
          parseInt(router.query.tourStopId, 10),
          {
            ...filteredOutputByWhitelist(
              multiLangRHFormDataToJson(
                newData,
                multiLangFieldsTourStop,
                config.activeLanguages
              ),
              [],
              multiLangFieldsTourStop
            ),
            ...heroImage,
            ...fieldImagesRFHFormDataToData(newData),
            locationId: newData.locationId,
          }
        );

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
              <TourStopForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModuleTourStopUpdateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default UpdateTourStop;
