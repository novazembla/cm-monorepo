import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@apollo/client";
import { BeatLoader } from "react-spinners";
import {
  filteredOutputByWhitelist,
  tourQueryGQL,
} from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleTourStopCreateSchema } from "./forms";
import { useTourStopCreateMutation } from "./hooks";
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

import { MultiLangValue } from "~/components/ui";

import { moduleRootPath, multiLangFieldsTourStop } from "./moduleConfig";

import { TourStopForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";

const CreateTourStop = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useTourStopCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const { data, loading, error } = useQuery(tourQueryGQL, {
    variables: {
      id: parseInt(router.query.tourId, 10),
    },
  });

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourStopCreateSchema as any),
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (newData: yup.InferType<typeof ModuleTourStopCreateSchema>) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { data, errors } = await firstMutation({
          tourId: parseInt(router.query.tourId, 10),
          locationId: newData.locationId,
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFieldsTourStop,
              config.activeLanguages
            ),
            [],
            multiLangFieldsTourStop
          ),
        });

        if (!errors && data?.tourStopCreate?.id) {
          successToast();
          setIsNavigatingAway(true);
          router.push(`${moduleRootPath}/${router.query.tourId}/update/${data?.tourStopCreate?.id}/`);
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
      path: `${moduleRootPath}/update/${router.query.tourId}/`,
      title:
        data && data.tour ? (
          <MultiLangValue json={data.tour.title} />
        ) : (
          <BeatLoader size="10px" color="#666" />
        ),
    },
    {
      title: t("module.tours.page.title.createtourStop", "New Tour Stop"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/update/${router.query.tourId}/`,
      label: t("module.button.cancel", "Cancel"),
      userCan: "tourRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.save", "Save"),
      userCan: "tourCreate",
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
              <TourStopForm
                action="create"
                data={data?.tour}
                validationSchema={ModuleTourStopCreateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default CreateTourStop;
