import { useTranslation } from "react-i18next";
import { Divider, Alert, AlertIcon } from "@chakra-ui/react";
import {
  FieldMultiLangInput,
  FieldInput,
  FieldRadioOrCheckboxGroup,
  FieldRadioOrCheckboxGroupOption,
  FieldRow,
  FieldSwitch,
  FieldSingleImage,
} from "~/components/forms";
import { useModules } from "~/hooks";
import { yupIsFieldRequired } from "~/validation";

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
      {action === "create" && <>
      
      <Alert borderRadius="lg">
      <AlertIcon />
  {t("form.info.pleasesafedraft", "Please save a draft to unlock further functionality")}
      </Alert>
    </>}
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.tours.forms.tour.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.tourStopRead?.title,
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
          defaultValues: data?.tourStopRead?.slug,
          placeholder: t(
            "module.tours.forms.tour.field.placeholder.slug",
            "Slug / URL part"
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
              imageRequired: true,
              altRequired: true,
              creditsRequired: true,
            }}
            connectWith={{
              heroImageTours: {
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
