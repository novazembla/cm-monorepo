import { useTranslation } from "react-i18next";
import { Divider, Alert, AlertIcon, chakra } from "@chakra-ui/react";
import { locationsSearchGQL } from "@culturemap/core";

import {
  FieldMultiLangInput,
  FieldMultiLangTextEditor,
  FieldSingleImage,
  FieldRow,
  FieldImages,
  FieldSingleSelectAutocomplete,
} from "~/components/forms";
import { getMultilangValue } from "~/utils";
import FieldMultiLangTextarea from "~/components/forms/FieldMultiLangTextarea";

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
          searchQueryDataKey="locations"
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
          maxLength: 200,
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
          {action === "update" && (
            <>
              <Divider mt="10" />
              <FieldImages
                id="images"
                name="images"
                label={t("forms.images.label", "Images")}
                currentImages={data?.tourStopRead?.images}
                settings={{
                  imageRequired: false,
                  altRequired: false,
                  creditsRequired: false,
                }}
                setActiveUploadCounter={setActiveUploadCounter}
                connectWith={{
                  tourStops: {
                    connect: {
                      id: data?.tourStopRead?.id,
                    },
                  },
                }}
              />
            </>
          )}
        </>
      )}
      <Divider mt="10" />

      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t("module.locations.forms.fieldSet.label.seo", "SEO")}
          </chakra.span>
        </legend>
        <FieldMultiLangTextarea
          name="metaDesc"
          id="metaDesc"
          type="basic"
          label={t(
            "module.locations.forms.location.field.label.metaDesc",
            "Meta Description"
          )}
          isRequired={false}
          settings={{
            defaultRequired: false,
            defaultValues: data?.tourStopRead?.metaDesc,
            maxLength: 350,
          }}
        />
      </chakra.fieldset>
    </>
  );
};
export default TourStopForm;
