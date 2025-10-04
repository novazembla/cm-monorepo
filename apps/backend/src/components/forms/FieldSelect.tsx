import React, { ChangeEventHandler } from "react";
import { useFormContext, Controller } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  VisuallyHidden,
} from "@chakra-ui/react";
import Select from "react-select";

import { FieldErrorMessage, flattenErrors } from ".";
import { reactSelectTheme } from "~/theme";

export interface FieldSelectSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  key?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
  hideLabel?: boolean;
}

export interface FieldSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const FieldSelect = ({
  settings,
  id,
  label,
  name,
  options,
  isRequired,
  isDisabled,
}: {
  settings?: FieldSelectSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  options: FieldSelectOption[];
}) => {
  const {
    formState: { errors },
    control,
    setValue,
    register,
  } = useFormContext();

  const fieldProps: FieldSelectSettings = {
    key: `key-${id}`,
    name: name,
  };

  fieldProps.className = settings?.className ?? undefined;

  fieldProps.placeholder = settings?.placeholder ?? undefined;

  const flattenedErrors = flattenErrors(errors);

  if (flattenedErrors[name]?.message) fieldProps.valid = undefined;

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      {settings?.hideLabel ? (
        <VisuallyHidden>
          <FormLabel htmlFor={id} mb="0.5">
            {label}
          </FormLabel>
        </VisuallyHidden>
      ) : (
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>
      )}

      <Controller
        name={`${name}_select`}
        control={control}
        render={({ field }) => (
          <Select
            styles={{
              control: (styles: any /*, state: any */) => ({
                ...styles,
                borderColor:  "var(--chakra-colors-gray-400)",
              }),
            }}
            defaultValue={options.find(
              (v) => v.value === settings?.defaultValue
            )}
            {...field}
            {...fieldProps}
            options={options}
            onChange={(value: any) => {
              setValue(name, value.value);
            }}
            theme={reactSelectTheme}
          />
        )}
      />

      <input
        type="hidden"
        defaultValue={settings?.defaultValue}
        {...register(name)}
      />

      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};

export default FieldSelect;
