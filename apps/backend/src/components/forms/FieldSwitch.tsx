import React from "react";
import { Switch, FormControl, Flex, chakra } from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";

import { FieldErrorMessage, flattenErrors } from ".";

export const FieldSwitch = ({
  name,
  label,
  isChecked,
  isRequired = false,
  isReadOnly = false,
  isDisabled = false,
  defaultChecked = false,
  colorScheme,
}: {
  name: string;
  label: string | React.ReactNode;
  isChecked?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  defaultChecked?: boolean;
  colorScheme?: string;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const flattenedErrors = flattenErrors(errors);

  return (
    <FormControl
      mt="1"
      {...{ isRequired, isDisabled, isReadOnly }}
      isInvalid={!!flattenedErrors[name]?.message}
    >
      <Flex alignItems="center">
        <Controller
          control={control}
          name={name}
          defaultValue={
            typeof defaultChecked === "boolean" ? defaultChecked : false
          }
          render={({ field: { onChange, onBlur, value } }) => {
            return (
            <Switch
              display="flex"
              mt="1"
              onChange={onChange}
              onBlur={onBlur}
              isDisabled={isDisabled}
              isChecked={typeof isChecked !== "undefined" ? !!isChecked : value}
              isInvalid={!!flattenedErrors[name]?.message}
              colorScheme={colorScheme}
              isRequired={isRequired}
              isReadOnly={isReadOnly}
            >
              <chakra.span fontSize="sm">{label}</chakra.span>
            </Switch>
          )}}
        />
      </Flex>
      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};
