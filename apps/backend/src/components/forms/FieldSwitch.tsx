import React from "react";
import { Switch, FormControl, Flex } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

import { FieldErrorMessage } from ".";

export const FieldSwitch = ({
  name,
  label,
  isRequired = false,
  isReadOnly = false,
  isDisabled = false,
  defaultChecked = false,
  colorScheme,
}: {
  name: string;
  label: string | React.ReactNode;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  defaultChecked?: boolean;
  colorScheme?: string;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormControl
      mt="1"
      {...{ isRequired, isDisabled, isReadOnly }}
      isInvalid={!!errors[name]?.message}
    >
      <Flex alignItems="center">
        <Switch
          
          id={name}
          mt="1"
          key={`key-${name}`}
          isInvalid={!!errors[name]?.message}
          {...{ isRequired, isDisabled, isReadOnly, defaultChecked, colorScheme }}
          {...register(name, { required: isRequired })}
          display="flex"
          
        >{label}</Switch>
      </Flex>
      <FieldErrorMessage error={errors[name]?.message} />
    </FormControl>
  );
};
