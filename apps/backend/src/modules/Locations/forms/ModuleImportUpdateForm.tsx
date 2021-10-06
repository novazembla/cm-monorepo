import { Alert, AlertIcon } from "@chakra-ui/react";

import { fileDeleteMutationGQL } from "@culturemap/core";

import { useTranslation } from "react-i18next";
import { FieldInput, FieldRow, FieldFileUploader } from "~/components/forms";

export const ModuleImportUpdateForm = ({
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

  const { importRead } = data;

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
      <FieldRow>
        <FieldFileUploader
          name="file"
          id="file"
          deleteButtonGQL={fileDeleteMutationGQL}
          setActiveUploadCounter={setActiveUploadCounter}
          label={t("module.locations.forms.import.field.label.csv", "CSV File")}
          isRequired={true}
          settings={{
            accept: ".csv",
            placeholder: t(
              "module.locations.forms.location.field.placeholder.csvfile",
              "Upload CSV"
            ),
          }}
        />
      </FieldRow>
    </>
  );
};
export default ModuleImportUpdateForm;
