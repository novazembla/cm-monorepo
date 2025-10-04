import { useTranslation } from "react-i18next";

import { Divider, Alert, AlertIcon, chakra } from "@chakra-ui/react";
import {
  FieldMultiLangInput,
  FieldSelect,
  FieldHidden,
  FieldPublishStatusSelect,
  FieldRow,
  FieldInput,
  TwoColFieldRow,
  FieldMultiLangTextEditor,
  FieldSingleImage,
} from "~/components/forms";
import { useAuthentication } from "~/hooks";
import { yupIsFieldRequired } from "~/validation";
import FieldMultiLangTextarea from "~/components/forms/FieldMultiLangTextarea";

export const TourForm = ({
  data,
  // errors,
  action,
  validationSchema,
  setActiveUploadCounter,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/ban-types
  setActiveUploadCounter?: Function;
}) => {
  const { t } = useTranslation();
  const [appUser] = useAuthentication();
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
      <FieldHidden id="path" name="path" defaultValue="{}" />
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.tours.forms.tour.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.tour?.title,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.title",
            "Tour name"
          ),
        }}
      />
      <FieldMultiLangInput
        name="slug"
        id="slug"
        type="text"
        label={t("module.tours.forms.tour.field.label.slug", "Slug")}
        isRequired={true}
        settings={{
          defaultValues: data?.tour?.slug,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      <FieldRow>
        <FieldInput
          id="orderNumber"
          type="text"
          name="orderNumber"
          label={t(
            "module.tours.forms.field.label.orderNumber",
            "Order number"
          )}
          isRequired={yupIsFieldRequired("orderNumber", validationSchema)}
          settings={{
            placeholder: "1",
          }}
        />
      </FieldRow>
      {action === "update" && (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data?.tour.ownerId}
                module="page"
                status={data?.tour?.status}
              />
            </FieldRow>
            <FieldRow>
              <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t("module.forms.field.label.author", "Author")}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") || data.ownerId === appUser.id)
                  )
                }
                isRequired={true}
                options={(data?.adminUsers ?? []).map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                settings={{
                  defaultValue: data?.tour?.ownerId,
                  placeholder: t(
                    "module.forms.field.placeholder.author",
                    "Please choose the author"
                  ),
                }}
              />
            </FieldRow>
          </TwoColFieldRow>
          <Divider mt="10" />
          <FieldSingleImage
            id="heroImage"
            name="heroImage"
            label={t("forms.heroImage.label", "Featured image")}
            currentImage={data?.tour?.heroImage}
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: false,
              altRequired: true,
              creditsRequired: true,
            }}
            connectWith={{
              heroImageTours: {
                connect: {
                  id: data?.tour?.id,
                },
              },
            }}
          />
        </>
      )}
      <Divider mt="10" />

      <FieldMultiLangInput
        name="duration"
        id="duration"
        type="text"
        label={t("module.tours.forms.tour.field.label.duration", "Duration")}
        isRequired={action === "update"}
        settings={{
          defaultValues: data?.tour?.duration,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.duration",
            "1 hr"
          ),
        }}
      />

      <FieldMultiLangInput
        name="distance"
        id="distance"
        type="text"
        label={t("module.tours.forms.tour.field.label.distance", "Distance")}
        isRequired={action === "update"}
        settings={{
          defaultValues: data?.tour?.distance,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.distance",
            "3 Kilometer"
          ),
        }}
      />

      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="teaser"
        id="teaser"
        type="basic"
        label={t("module.tours.forms.tour.field.label.teaser", "Intro")}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.tour?.teaser,
          maxLength: 200,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.teaser",
            "Tour listing teaser"
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
          "module.tours.forms.tour.field.label.description",
          "Description"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.tour?.description,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.description",
            "Full tour description"
          ),
        }}
      />
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
            defaultValues: data?.tour?.metaDesc,
            maxLength: 350,
          }}
        />
      </chakra.fieldset>
    </>
  );
};
export default TourForm;
