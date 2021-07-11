import React from "react";
import { useFormContext } from "react-hook-form";
import { Input, Label } from "@windmill/react-ui";

import ErrorMessage from "./ErrorMessage";

export interface FieldInputData {
  onChange?: Function;
  rows?: number;
  key?: string;
  name?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
  autoResize?: {
    min: number;
    max: number;
  };
}

export interface FieldPropsData extends FieldInputData {
  css: string;
}

type ComponentProps = {
  data: FieldInputData;
  id: string;
  label: string;
  name: string;
  type: string;
};

const FieldInput = ({ data, id, label, name, type }: ComponentProps) => {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  let fieldProps:FieldPropsData = {
    key: `key-${id}`,
    name: name,
    type: type,
    css: '',
  };

  fieldProps.onChange = data.onChange ?? undefined;

  fieldProps.rows = data.rows ?? undefined;

  fieldProps.defaultValue = data.defaultValue ?? undefined;

  fieldProps.className = data.className ?? undefined;

  fieldProps.placeholder = data.placeholder ?? undefined;

  if (errors[name]?.message) fieldProps.valid = undefined;

  // TODO: autoResize ever used?
  if (data.autoResize) {
    const autoResizeOnChange = (event: React.FormEvent<HTMLInputElement>) => {
      (event.target as HTMLInputElement).style.height = "";
      (event.target as HTMLInputElement).style.height =
        Math.max(
          (data.autoResize)? data.autoResize.min : 0,
          Math.min((data.autoResize)? data.autoResize.min : 1000, (event.target as HTMLInputElement).scrollHeight)
        ) + "px";
    };

    if (typeof data.onChange === "function") {
      fieldProps.onChange = (event: React.FormEvent<HTMLInputElement>) => {
        data.onChange && data.onChange.call(null, event);
        autoResizeOnChange.call(null, event);
      };
    } else {
      fieldProps.onChange = autoResizeOnChange;
    }
  }
  // TODO: <Label  htmlFor={id} ...></Label> does not work
  return (
    <>
      <Label>
        <span>{label}</span>
        <Input {...fieldProps} {...register(id)} />
        {errors[name]?.message && (
          <ErrorMessage error={errors[name]?.message}></ErrorMessage>
        )}
      </Label>
    </>
  );
};

export default FieldInput;
