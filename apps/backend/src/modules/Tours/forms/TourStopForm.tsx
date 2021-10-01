import { useTranslation } from "react-i18next";
import { Divider, Alert, AlertIcon } from "@chakra-ui/react";
import { locationsSearchGQL } from "@culturemap/core";

import {
  FieldMultiLangInput,
  FieldMultiLangTextEditor,
  FieldSingleImage,
  FieldRow,
  FieldSingleSelectAutocomplete,
} from "~/components/forms";
import { getMultilangValue } from "~/utils";

export const TourStopForm = ({
  data,
  errors,
  action,
  validationSchema,
  setActiveUploadCounter,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  setActiveUploadCounter?: Function;
}) => {
  const { t } = useTranslation();

  console.log(data?.tourStopRead);

  return (
    <>
      {action === "create" && (
        <>
          <Alert borderRadius="lg">
            <AlertIcon />
            {t(
              "form.info.pleasesafedraft",
              "Please save a draft to unlock further functionality"
            )}
          </Alert>
        </>
      )}
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.tours.forms.tourStop.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.tourStopRead?.title,
          placeholder: t(
            "module.tours.forms.tourStop.field.placeholder.title",
            "Tour stop name"
          ),
        }}
      />
      <Divider mt="10" />
      <FieldRow>
        <FieldSingleSelectAutocomplete
          name="locationId"
          id="locationId"
          label={t("forms.field.label.location", "Location")}
          isRequired={true}
          item={
            data?.tourStopRead?.location && data?.tourStopRead?.location?.id
              ? {
                  label: getMultilangValue(data?.tourStopRead?.location.title),
                  id: data?.tourStopRead?.location.id,
                }
              : undefined
          }
          searchQueryGQL={locationsSearchGQL}
          settings={{
            placeholder: t(
              "forms.field.placeholder.locationsearch",
              "Please enter the location's title"
            ),
          }}
        />
      </FieldRow>
      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="teaser"
        id="teaser"
        type="basic"
        label={t("module.tours.forms.tourStop.field.label.teaser", "Intro")}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.tourStopRead?.teaser,
          placeholder: t(
            "module.tours.forms.tourStop.field.placeholder.teaser",
            "Tour stop listing teaser"
          ),
        }}
      />
      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="description"
        id="description"
        type="basic"
        size="large"
        label={t(
          "module.tours.forms.tourStop.field.label.description",
          "Description"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.tourStopRead?.description,
          placeholder: t(
            "module.tours.forms.tourStop.field.placeholder.description",
            "Full tour stop description"
          ),
        }}
      />
      {action === "update" && (
        <>
          <Divider mt="10" />
          <FieldSingleImage
            id="heroImage"
            name="heroImage"
            label={t("forms.heroImage.label", "Featured image")}
            currentImage={data?.tourStopRead?.heroImage}
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: false,
              altRequired: true,
              creditsRequired: true,
            }}
            connectWith={{
              heroImageTourStops: {
                connect: {
                  id: data?.tourStopRead?.id,
                },
              },
            }}
          />
        </>
      )}
    </>
  );
};
export default TourStopForm;
