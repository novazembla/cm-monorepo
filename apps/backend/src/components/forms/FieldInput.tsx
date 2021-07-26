import React, { ChangeEventHandler, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useBoolean
} from "@chakra-ui/react";

import { HiEyeOff, HiEye } from "react-icons/hi";

import ErrorMessage from "./ErrorMessage";

export interface FieldInputData {
  onChange?: ChangeEventHandler;
  rows?: number;
  required?: boolean;
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
  const [revealFlag, setTevealFlag] = useBoolean()

  const {
    formState: { errors },
    register,
    trigger,
  } = useFormContext();

  let fieldProps: FieldPropsData = {
    key: `key-${id}`,
    name: name,
    type: type,
    css: "",
  };

  fieldProps.rows = data.rows ?? undefined;

  fieldProps.required = data.required ?? undefined;

  fieldProps.defaultValue = data.defaultValue ?? undefined;

  fieldProps.className = data.className ?? undefined;

  fieldProps.placeholder = data.placeholder ?? undefined;

  if (errors[name]?.message) fieldProps.valid = undefined;

  const onChangeHandler: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    data.onChange && data.onChange.call(null, event);

    if (data.autoResize) {
      (event.target as HTMLInputElement).style.height = "";
      (event.target as HTMLInputElement).style.height =
        Math.max(
          data.autoResize ? data.autoResize.min : 0,
          Math.min(
            data.autoResize ? data.autoResize.min : 1000,
            (event.target as HTMLInputElement).scrollHeight
          )
        ) + "px";
    }

    trigger(name);
  };

  fieldProps.onChange = onChangeHandler;

  fieldProps.type = revealFlag ? "text" : fieldProps.type;
  
  let input = <Input
    pr="4.5rem"
    {...register(id)}
    {...fieldProps}
    
  />;

  if (type === "password") {
    input = <InputGroup size="md">
      {input}
      <InputRightElement width="3.5rem">
        <Button h="1.75rem" size="md" m="0" p="1" onClick={setTevealFlag.toggle}>
          {revealFlag ? <HiEyeOff /> : <HiEye />}
        </Button>
      </InputRightElement>
    </InputGroup>;

  }
  
  console.log(errors)
  
  // xxx first change shold trigger validation ... 
  return (
    <FormControl id={id} isInvalid={errors[name]?.message} isRequired={fieldProps.required}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {input}
      <ErrorMessage error={errors[name]?.message}></ErrorMessage>
    </FormControl>
  );
};

export default FieldInput;
