import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { tourStopDeleteMutationGQL } from "@culturemap/core";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleTourSchemaUpdate, TourStopListing } from "./forms";
import {
  useTourUpdateMutation,
  useTourReorderTourStopsMutation,
  useTourStopDeleteMutation,
} from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
  useModules,
  useDeleteByIdButton,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFieldsTour } from "./moduleConfig";

import { TourForm, TourPathEditor } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
  multiLangImageMetaRHFormDataToJson,
  multiLangTranslationsJsonRHFormData,
  getMultilangValue,
} from "~/utils";

export const tourAndContentAuthorsQueryGQL = gql`
  query tour($id: Int!) {
    tour(id: $id) {
      id
      title
      slug
      orderNumber
      distance
      duration
      teaser
      description
      ownerId
      status
      path
      heroImage {
        id
        meta
        status
        alt
        credits
        cropPosition
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
  const [appUser, { getPreviewUrl }] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);
  const [tourStops, setTourStops] = useState<any[]>([]);

  const modules = useModules();

  const { data, loading, error } = useQuery(tourAndContentAuthorsQueryGQL, {
    variables: {
      id: parseInt(router.query.tourId, 10),
    },
  });

  const [firstMutation, firstMutationResults] = useTourUpdateMutation();
  const [reorderMutation] = useTourReorderTourStopsMutation();
  const [tourStopDeleteMutation] = useTourStopDeleteMutation();

  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const [tourStopDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      tourStopDeleteMutationGQL,
      (id: number | undefined) => {
        setTourStops(tourStops.filter((ts: any) => ts.id !== id));;
      },
      {
        requireTextualConfirmation: false,
      }
    );

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleTourSchemaUpdate as any),
  });

  const {
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data?.tour) return;

    setTourStops(data?.tour?.tourStops ?? []);

    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(data?.tour, [], multiLangFieldsTour),
        multiLangFieldsTour,
        config.activeLanguages
      ),
      status: data?.tour?.status,
      orderNumber: data?.tour?.orderNumber,
      ownerId: data?.tour?.ownerId,
      path: data?.tour?.path,
      heroImage: data?.tour?.heroImage?.id,
      heroImage_cropPosition: data.tour.heroImage?.cropPosition,
      ...multiLangTranslationsJsonRHFormData(
        data?.tour?.heroImage,
        ["alt", "credits"],
        config.activeLanguages,
        "heroImage"
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
                // images: {
                //   set: [{
                //     id: 17
                //   }],
                //   update: [
                //     {
                //       where: {
                //         id: 17,
                //       },
                //       data: {
                //         alt_de: "17xxx alt_de updated title",
                //         alt_en: "17xxx alt_en updated title",
                //         credits_de: "17xxx credits_de updated title",
                //         credits_en: "17xxx credits_en updated title",
                //         // ...multiLangImageMetaRHFormDataToJson(
                //         //   newData,
                //         //   "heroImage",
                //         //   ["alt", "credits"],
                //         //   config.activeLanguages
                //         // ),
                //       },
                //     },
                //   ],
                // },
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
            orderNumber: parseInt(newData.orderNumber),
            path: newData.path,
            ...heroImage,
            owner: {
              connect: {
                id: parseInt(newData.ownerId),
              },
            },
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
      type: "link",
      href: getPreviewUrl(`/tour/${getMultilangValue(data?.tour?.slug)}`),
      label: t("module.button.preview", "Preview"),
      targetBlank: true,
      userCan: "pageReadOwn",
      isDisabled:
        !!error ||
        [
          PublishStatus.PUBLISHED,
          PublishStatus.TRASHED,
          PublishStatus.DELETED,
        ].includes(parseInt(watch("status") ?? "0")),
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
              {(hasFormError || isDeleteError) && (
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
                    const newStopsOrder = stops.map(
                      (newStop: any, index: number) => {
                        const s = tourStops.find(
                          (ts) => ts.id === newStop.tourStopId
                        );

                        return {
                          ...s,
                          number: index + 1,
                        };
                      }
                    );

                    setTourStops(newStopsOrder);
                  } catch (err) {
                    console.log(err);
                  }
                }}
                onStopDelete={tourStopDeleteButtonOnClick}
              />
              <TourPathEditor
                tourStops={tourStops.map((stop) => ({
                  number: stop.number,
                  lat: stop.location.lat,
                  lng: stop.location.lng,
                }))}
                path={data?.tour?.path ?? {}}
                name="path"
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
      {DeleteAlertDialog}
    </>
  );
};
export default Update;
