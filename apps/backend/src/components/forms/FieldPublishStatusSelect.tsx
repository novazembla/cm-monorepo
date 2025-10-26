import { useFormContext, Controller } from "react-hook-form";
import { PublishStatus, PermissionNames } from "@culturemap/core";
import { useTranslation } from "react-i18next";

import { FormControl, FormLabel } from "@chakra-ui/react";

import Select from "react-select";

import { FieldErrorMessage, flattenErrors } from ".";
import { useAuthentication } from "~/hooks";
import { reactSelectTheme } from "~/theme";

export const FieldPublishStatusSelect = ({
  status,
  module,
  ownerId,
}: {
  status: PublishStatus;
  module: string;
  ownerId: number;
}) => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();

  const name = "status";
  const id = "status";

  const label = t("PublishStatus.select.label", "Publish status");

  const {
    formState: { errors },
    control,
    register,
    setValue,
  } = useFormContext();

  const options = [
    {
      value: PublishStatus.SUGGESTION,
      label: t("publish.status.suggestion", "Suggestion"),
    },
    {
      value: PublishStatus.IMPORTED,
      label: t("publish.status.imported", "Imported"),
    },
    {
      value: PublishStatus.IMPORTEDWARNINGS,
      label: t("publish.status.importedwarning", "Imported with warning(s)"),
    },
    {
      value: PublishStatus.DRAFT,
      label: t("publish.status.draft", "Draft"),
    },
    {
      value: PublishStatus.FORREVIEW,
      label: t("publish.status.forreview", "For review"),
    },
    {
      value: PublishStatus.REJECTED,
      label: t("publish.status.rejected", "Rejected"),
      disabled: !appUser?.has("editor"),
    },
    {
      value: PublishStatus.PUBLISHED,
      label: t("publish.status.published", "Published"),
      disabled: !appUser?.has("editor"),
    },
    {
      value: PublishStatus.TRASHED,
      label: t("publish.status.trashed", "Trashed"),
      disabled: !(
        appUser?.has("editor") ||
        (appUser?.is("contributor") &&
          appUser?.can(`${module}DeleteOwn` as PermissionNames) &&
          ownerId === appUser.id)
      ),
    },
  ];

  const flattenedErrors = flattenErrors(errors);

  const defaultStatus =
    status === PublishStatus.AUTODRAFT ? PublishStatus.DRAFT : status;
  return (
    <FormControl id={id} isInvalid={flattenedErrors[name]?.message} isRequired>
      <FormLabel htmlFor={id} mb="0.5">
        {label}
      </FormLabel>
      <Controller
        name={`${name}_select`}
        control={control}
        render={({ field }) => (
          <Select
            styles={{
              control: (styles: any /*, state: any */) => ({
                ...styles,
                borderColor: "var(--chakra-colors-gray-400)",
              }),
            }}
            defaultValue={options.find((v) => v.value === defaultStatus)}
            {...field}
            placeholder={t(
              "PublishStatus.select.placeholder",
              "Please choose a publish status"
            )}
            options={options}
            onChange={(value: any) => {
              setValue(name, value.value);
            }}
            theme={reactSelectTheme}
          />
        )}
      />

      <input type="hidden" defaultValue={defaultStatus} {...register(name)} />

      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};

export default FieldPublishStatusSelect;
