import { Alert, AlertIcon } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FieldInput, FieldRow } from "~/components/forms";

export const ModuleImportCreateForm = ({
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
      <FieldRow>
        <FieldInput
          name="title"
          id="title"
          type="text"
          label={t("module.locations.forms.import.field.label.title", "Title")}
          isRequired={true}
          settings={{
            placeholder: t(
              "module.locations.forms.location.field.placeholder.title",
              "Import title"
            ),
          }}
        />
      </FieldRow>
    </>
  );
};
export default ModuleImportCreateForm;
