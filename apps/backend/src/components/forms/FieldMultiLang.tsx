import React, {
  ChangeEventHandler,
  ChangeEvent,
} from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  Input,
  chakra
} from "@chakra-ui/react";

import FieldErrorMessage from "./FieldErrorMessage";
import TwoColFieldRow from "./TwoColFieldRow";
import { useConfig } from "~/hooks";
import FieldRow from "./FieldRow";

export interface FieldMultiLangSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  defaultRequired?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
  defaultValues?: any;
  valid?: boolean;
}

export interface FieldMultiLangFieldProps {
  required?: boolean;
  autoComplete?: string;
  name?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
}

export const FieldMultiLang = ({
  settings,
  id,
  label,
  name,
  type,
  isRequired,
  isDisabled,
}: {
  settings?: FieldMultiLangSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  type: string;
}) => {
  const config = useConfig();

  const {
    formState: { errors },
    register,
    getValues
  } = useFormContext();

  let fieldProps: FieldMultiLangFieldProps = {
    type: type,
    autoComplete: "new-password",
  };

  if (settings?.autoComplete)
    fieldProps.autoComplete = settings?.autoComplete;

  fieldProps.className = settings?.className ?? undefined;

  
  fieldProps.placeholder = settings?.placeholder ?? undefined;

  const onChangeHandler: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    console.log(getValues());
    settings?.onChange && settings?.onChange.call(null, event);
  };

  return (
    <TwoColFieldRow>
      {config.activeLanguages &&
        config.activeLanguages.map((lang) => {
          const field_id = `${id}_${lang}`;
          const field_name = `${name}_${lang}`;
          const field_required = isRequired ||
          (lang === config.defaultLanguage && settings?.defaultRequired === true)
          const { ref, onBlur, onChange } = register(field_id, {
            required:field_required
            
          });

          if (settings?.defaultValues && settings.defaultValues[lang])
            fieldProps.defaultValue = settings.defaultValues[lang];

          if (errors[field_name]?.message) fieldProps.valid = undefined;

          return (
            <FieldRow key={field_id}>
              <FormControl
                id={field_id}
                isInvalid={errors[field_name]?.message}
                {...{ isRequired: field_required, isDisabled }}
              >
                <FormLabel htmlFor={field_id} mb="0.5">
                  {label} (<chakra.span textTransform="uppercase">{lang}</chakra.span>)
                </FormLabel>
                <Input
                  name={field_name}
                  onBlur={(event) => {
                    onBlur(event);
                    onChangeHandler(event);
                  }}
                  onChange={(event) => {
                    onChange(event);
                    onChangeHandler(event);
                  }}
                  {...fieldProps}
                  ref={ref}
                />
                <FieldErrorMessage error={errors[field_name]?.message} />
              </FormControl>
            </FieldRow>
          );
        })}
    </TwoColFieldRow>
  );
};

export default FieldMultiLang;
