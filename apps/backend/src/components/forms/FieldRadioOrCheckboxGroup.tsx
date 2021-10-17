import React from "react";
import {
  Checkbox,
  Box,
  Flex,
  FormControl,
  RequiredIndicator,
  chakra,
} from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";
import { MultiLangValue } from "~/components/ui";
import { FieldErrorMessage, flattenErrors } from ".";

export type FieldRadioOrCheckboxGroupOption = {
  label: string;
  id: string | number;
};

export const FieldRadioOrCheckboxGroup = ({
  id,
  label,
  name,
  type, // TODO: allow for radio boxes ...
  options,
  defaultValues,
  isRequired,
  isDisabled,
}: {
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string | React.ReactNode;
  name: string;
  type: string;
  options: FieldRadioOrCheckboxGroupOption[];
  defaultValues?: any[];
}) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  if (!options || options.length === 0) return <></>;

  const flattenedErrors = flattenErrors(errors);

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="2"
        borderRadius="md"
      >
        <legend>
          <chakra.span px="2">
            {label}
            {isRequired && <RequiredIndicator />}
          </chakra.span>
        </legend>

        <Flex flexWrap="wrap">
          {options.map((option, index) => (
            <Controller
              key={`${name}_${option.id}`}
              control={control}
              name={`${name}_${option.id}`}
              defaultValue={
                defaultValues && defaultValues[`${name}_${option.id}` as any]
              }
              render={({ field: { onChange, onBlur, value, ref } }) => {
                return (
                  <Checkbox
                    value={option.id}
                    onChange={onChange}
                    onBlur={onBlur}
                    isDisabled={isDisabled}
                    isChecked={value}
                    isInvalid={flattenedErrors[name]?.message}
                    pr="6"
                    isRequired={isRequired}
                    mb="2"
                    maxW={{ base: "50%", t: "33.33%", d: "25%" }}
                  >
                    <MultiLangValue json={option.label} />
                  </Checkbox>
                );
              }}
            />
          ))}
        </Flex>
        <Box transform="translateY(-10px)">
          <FieldErrorMessage error={flattenedErrors[name]?.message} />
        </Box>
      </chakra.fieldset>
    </FormControl>
  );
};
