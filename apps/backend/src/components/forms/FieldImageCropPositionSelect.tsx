import { useFormContext, Controller } from "react-hook-form";
import { ImageCropPosition } from "@culturemap/core";
import { useTranslation } from "react-i18next";

import { FormControl, FormLabel, Select } from "@chakra-ui/react";

import { FieldErrorMessage, flattenErrors } from ".";

export const FieldImageCropPositionSelect = ({
  cropPosition,
  name,
}: {
  name: string;
  cropPosition: ImageCropPosition;
}) => {
  const { t } = useTranslation();

  const id = name;

  const label = t("image.cropPosition.select.label", "Image crop position");

  const {
    formState: { errors },
    control,
  } = useFormContext();

  const options = [
    {
      value: ImageCropPosition.CENTER,
      label: t("image.cropPosition.center", "Centered"),
    },
    {
      value: ImageCropPosition.TOP,
      label: t("image.cropPosition.top", "Top"),
    },
    {
      value: ImageCropPosition.RIGHT,
      label: t("image.cropPosition.right", "Right"),
    },
    {
      value: ImageCropPosition.BOTTOM,
      label: t("image.cropPosition.bottom", "Bottom"),
    },
    {
      value: ImageCropPosition.LEFT,
      label: t("image.cropPosition.left", "Left"),
    },
  ];

  const flattenedErrors = flattenErrors(errors);

  return (
    <FormControl id={id} isInvalid={flattenedErrors[name]?.message} isRequired>
      <FormLabel htmlFor={id} mb="0.5">
        {label}
      </FormLabel>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <Select
            onBlur={onBlur}
            onChange={onChange}
            isRequired
            defaultValue={cropPosition ?? 0}
            valid={!flattenedErrors[name]?.message ? "valid" : undefined}
            placeholder={t(
              "image.cropPosition.select.placeholder",
              "Please choose a crop position"
            )}
            size="md"
            ref={ref}
          >
            {options &&
              options.map((option, i) => (
                <option key={`${id}-o-${i}`} value={option.value}>
                  {option.label}
                </option>
              ))}
          </Select>
        )}
      />

      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};

export default FieldImageCropPositionSelect;
