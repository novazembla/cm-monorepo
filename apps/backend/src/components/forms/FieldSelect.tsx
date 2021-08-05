import React, { ChangeEventHandler, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormLabel, Select } from "@chakra-ui/react";

import FieldErrorMessage from "./FieldErrorMessage";

export interface FieldSelectSettings {
  onChange?: ChangeEventHandler;
  rows?: number;
  required?: boolean;
  key?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
  
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
  options: {value:string;label:string}[];
}) => {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  let fieldProps: FieldSelectSettings = {
    key: `key-${id}`,
    name: name,
  };

  if (settings?.defaultValue) fieldProps.defaultValue = settings?.defaultValue;

  fieldProps.className = settings?.className ?? undefined;

  fieldProps.placeholder = settings?.placeholder ?? undefined;

  if (errors[name]?.message) fieldProps.valid = undefined;

  const { ref, onBlur, onChange } = register(id, { required: isRequired });

  return (
    <FormControl
      id={id}
      isInvalid={errors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      <FormLabel htmlFor={id} mb="0.5">
        {label}
      </FormLabel>
      <Select
        name={name}
        onBlur={onBlur}
        onChange={(event: ChangeEvent) => {
          onChange(event);
          settings?.onChange && settings?.onChange.call(null, event);
        }}
        {...fieldProps}
        ref={ref}
        size="md"
      >
        {options && options.map((option, i) => <option key={`${id}-o-${i}`} value={option.value}>{option.label}</option>)}
      </Select>
      <FieldErrorMessage error={errors[name]?.message} />
    </FormControl>
  );
};

export default FieldSelect;
