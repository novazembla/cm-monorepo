import React, { ChangeEventHandler, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormLabel, Input, chakra, Flex } from "@chakra-ui/react";

import FieldErrorMessage from "./FieldErrorMessage";
import TwoColFieldRow from "./TwoColFieldRow";
import { useConfig } from "~/hooks";
import FieldRow from "./FieldRow";

export interface FieldMultiLangInputSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  defaultRequired?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
  defaultValues?: any;
  valid?: boolean;
}

export interface FieldMultiLangInputFieldProps {
  required?: boolean;
  autoComplete?: string;
  name?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
}

export const FieldMultiLangInput = ({
  settings,
  id,
  label,
  name,
  type,
  isRequired,
  isDisabled,
}: {
  settings?: FieldMultiLangInputSettings;
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
    register
  } = useFormContext();

  let fieldProps: FieldMultiLangInputFieldProps = {
    type: type,
    autoComplete: "new-password",
  };

  if (settings?.autoComplete) fieldProps.autoComplete = settings?.autoComplete;

  fieldProps.className = settings?.className ?? undefined;

  fieldProps.placeholder = settings?.placeholder ?? undefined;

  const onChangeHandler: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    settings?.onChange && settings?.onChange.call(null, event);
  };

  return (
    <TwoColFieldRow type="multilang">
      {config.activeLanguages &&
        config.activeLanguages.map((lang) => {
          const field_id = `${id}_${lang}`;
          const field_name = `${name}_${lang}`;
          const field_required =
            isRequired ||
            (lang === config.defaultLanguage &&
              settings?.defaultRequired === true);
          const { ref, onBlur, onChange } = register(field_id, {
            required: field_required,
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
                <Flex direction={{base:"column",mw:"row",t:"column"}}>
                  <FormLabel htmlFor={field_id} mb="0.5" w={{base:"100%", mw:"30%", t:"100%"}}>
                    {label} (
                    <chakra.span textTransform="uppercase">{lang}</chakra.span>)
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
                </Flex>
              </FormControl>
            </FieldRow>
          );
        })}
    </TwoColFieldRow>
  );
};

export default FieldMultiLangInput;
