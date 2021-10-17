import React, { ChangeEventHandler, ChangeEvent } from "react";
import { useFormContext, Controller } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  Select,
  VisuallyHidden,
} from "@chakra-ui/react";

import { FieldErrorMessage, flattenErrors } from ".";

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
  } = useFormContext();

  let fieldProps: FieldSelectSettings = {
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
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value, name, ref },
          fieldState: { invalid, isTouched, isDirty, error },
          formState,
        }) => {
          return (
            <Select
              onBlur={onBlur}
              onChange={(event: ChangeEvent) => {
                onChange(event);
                settings?.onChange && settings?.onChange.call(null, event);
              }}
              {...fieldProps}
              size="md"
              ref={ref}
              defaultValue={settings?.defaultValue}
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
          );
        }}
      />

      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};

export default FieldSelect;
