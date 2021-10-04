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

import { ModuleTourSchemaUpdate, TourStopListing } from "./forms";
import {
  useTourUpdateMutation,
  useTourReorderTourStopsMutation,
} from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
  useModules,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFieldsTour } from "./moduleConfig";

import { TourForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  multiLangImageTranslationsRHFormDataToJson,
  multiLangImageTranslationsJsonRHFormData,
} from "~/utils";

export const tourReadAndContentAuthorsQueryGQL = gql`
  query tourRead($id: Int!) {
    tourRead(id: $id) {
      id
      title
      slug
      distance
      duration
      teaser
      description
      ownerId
      status
      heroImage {
        id
        meta
        status
        alt
        credits
      }
      tourStopCount
      tourStops {
        id
        title
        number

        location {
          title
          lat
          lng
        }
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
  const [tourStops, setTourStops] = useState<any[]>([]);

  const modules = useModules();

  const { data, loading, error } = useQuery(tourReadAndContentAuthorsQueryGQL, {
    variables: {
      id: parseInt(router.query.tourId, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTourUpdateMutation();
  const [reorderMutation] = useTourReorderTourStopsMutation();

  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourSchemaUpdate),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.tourRead) return;

    setTourStops(data?.tourRead?.tourStops ?? []);

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data.tourRead, [], multiLangFieldsTour),
        multiLangFieldsTour,
        config.activeLanguages
      ),
      status: data?.tourRead?.status,
      ownerId: data?.tourRead?.ownerId,
      path: data?.tourRead?.path,
      heroImage: data?.tourRead?.heroImage?.id,
      ...multiLangImageTranslationsJsonRHFormData(
        data?.tourRead,
        ["heroImage"],
        ["alt", "credits"],
        config.activeLanguages
      ),
    });
  }, [reset, data, config.activeLanguages, modules]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleTourSchemaUpdate>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        let path = {};

        try {
          path = JSON.parse(newData.path);
        } catch (err) {}

        const heroImage =
          newData.heroImage &&
          !isNaN(newData.heroImage) &&
          newData.heroImage > 0
            ? {
                heroImage: {
                  connect: {
                    id: newData.heroImage,
                  },
                },
              }
            : undefined;

        const { errors } = await firstMutation(
          parseInt(router.query.tourId, 10),
          {
            ...filteredOutputByWhitelist(
              multiLangRHFormDataToJson(
                newData,
                multiLangFieldsTour,
                config.activeLanguages
              ),
              [],
              multiLangFieldsTour
            ),
            status: parseInt(newData.status),
            path,
            ...heroImage,
            owner: {
              connect: {
                id: parseInt(newData.ownerId),
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
          setIsNavigatingAway(true);
          router.push(moduleRootPath);
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
      title: t("module.tours.page.title.updatetour", "Update tour"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
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
              <TourForm
                action="update"
                data={data}
                setActiveUploadCounter={setActiveUploadCounter}
                validationSchema={ModuleTourSchemaUpdate}
              />
              <TourStopListing
                tourStops={tourStops}
                onSortUpdate={async (stops: any) => {
                  try {
                    
                    await reorderMutation(
                      parseInt(router.query.tourId),
                      stops.map((stop: any, index: number) => ({
                        id: parseInt(stop.tourStopId),
                        number: index + 1,
                      }))
                    );
                    const newStopsOrder =stops.map((newStop: any, index: number) => {
                      const s = tourStops.find((ts) => ts.id === newStop.tourStopId);

                      return {
                        ...s,
                        number: index + 1
                      };
                      
                    });

                    setTourStops(newStopsOrder);
                   
                  } catch (err) {
                    console.log(err);
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
