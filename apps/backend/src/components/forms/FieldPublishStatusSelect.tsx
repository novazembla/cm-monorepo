import { useFormContext, Controller } from "react-hook-form";
import { PublishStatus, PermissionNames } from "@culturemap/core";
import { useTranslation } from "react-i18next";

import { FormControl, FormLabel, Select } from "@chakra-ui/react";

import FieldErrorMessage from "./FieldErrorMessage";
import { useAuthentication } from "~/hooks";

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
  } = useFormContext();

  const options = [
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

  return (
    <FormControl id={id} isInvalid={errors[name]?.message} isRequired>
      <FormLabel htmlFor={id} mb="0.5">
        {label}
      </FormLabel>

      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value, name, ref },
          fieldState: { invalid, isTouched, isDirty, error },
          formState,
        }) => (
          <Select
            onBlur={onBlur}
            onChange={onChange}
            isRequired
            defaultValue={
              status === PublishStatus.AUTODRAFT ? PublishStatus.DRAFT : status
            }
            valid={!errors[name]?.message ? "valid" : undefined}
            placeholder={t(
              "PublishStatus.select.placeholder",
              "Please choose a publish status"
            )}
            size="md"
            ref={ref}
          >
            {options &&
              options.map((option, i) => (
                <option
                  key={`${id}-o-${i}`}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
          </Select>
        )}
      />

      <FieldErrorMessage error={errors[name]?.message} />
    </FormControl>
  );
};

export default FieldPublishStatusSelect;
