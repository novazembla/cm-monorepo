import { useTranslation } from "react-i18next";
import { Divider, Alert, AlertIcon } from "@chakra-ui/react";
import {
  FieldMultiLangInput,
  FieldSelect,
  FieldHidden,
  FieldPublishStatusSelect,
  FieldRow,
  TwoColFieldRow,
  FieldMultiLangTextEditor,
  FieldSingleImage,
} from "~/components/forms";
import { useAuthentication } from "~/hooks";

export const TourForm = ({
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
      <FieldHidden 
        id="path"
        name="path"
        defaultValue="{}"
      />
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.tours.forms.tour.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.tourRead?.title,
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
          defaultValues: data?.tourRead?.slug,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {action === "update" && (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data?.tourRead.ownerId}
                module="page"
                status={data?.tourRead?.status}
              />
            </FieldRow>
            <FieldRow>
              <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t(
                  "module.forms.field.label.author",
                  "Author"
                )}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") ||
                      data.ownerId === appUser.id)
                  )
                }
                isRequired={true}
                options={(data?.adminUsers ?? []).map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                settings={{
                  defaultValue: data?.tourRead?.ownerId,
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
            currentImage={data?.tourRead?.heroImage}
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: true,
              altRequired: true,
              creditsRequired: true,
            }}
            connectWith={{
              heroImageTours: {
                connect: {
                  id: data?.tourRead?.id,
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
        isRequired={true}
        settings={{
          defaultValues: data?.tourRead?.duration,
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
        isRequired={true}
        settings={{
          defaultValues: data?.tourRead?.distance,
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
          defaultValues: data?.tourRead?.teaser,
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
          defaultValues: data?.tourRead?.description,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.description",
            "Full tour description"
          ),
        }}
      />
    </>
  );
};
export default TourForm;
