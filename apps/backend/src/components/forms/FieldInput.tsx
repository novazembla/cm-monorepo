import React, {
  ChangeEventHandler,
  ChangeEvent,
  MouseEventHandler,
  MouseEvent,
  useRef
} from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useBoolean,
} from "@chakra-ui/react";

import { useTranslation } from "react-i18next";
import { HiOutlineEyeOff, HiOutlineEye } from "react-icons/hi";

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

export const FieldInput = ({ data, id, label, name, type }: ComponentProps) => {
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const [revealFlag, setTevealFlag] = useBoolean();
  const { t } = useTranslation();

  const {
    formState: { errors, dirtyFields },
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

    dirtyFields[name] && trigger(name);
  };

  fieldProps.onChange = onChangeHandler;

  fieldProps.type = revealFlag ? "text" : fieldProps.type;

  

  const visibilityClickEvent: MouseEventHandler<HTMLButtonElement> = (
    event: MouseEvent
  ) => {
    setTevealFlag.toggle();
    fieldRef?.current?.focus();
  };


  const { ref, ...rest} = register(id);

  let input = <Input {...rest}  {...fieldProps} ref={(e: HTMLInputElement) => {
    ref(e)
    fieldRef.current = e;// you can still assign to ref
  }} />;

  if (type === "password") {
    input = (
      <InputGroup size="md">
        {input}
        <InputRightElement width="2.5rem">
          <IconButton
            border="1px"
            borderColor="gray.400"
            colorScheme="gray"
            color="gray.800"
            aria-label={
              revealFlag
                ? t("ui.button.label.show", "Show")
                : t("ui.button.label.hide", "Hide")
            }
            size="sm"
            onClick={visibilityClickEvent}
            h="1.75rem"
            w="1.75rem"
            lineHeight="1.75rem"
            fontSize="1.25rem"
            minW="1.75rem"
            icon={revealFlag ? <HiOutlineEyeOff /> : <HiOutlineEye />}
          />
        </InputRightElement>
      </InputGroup>
    );
  }

  console.log(errors, dirtyFields);

  // xxx first change shold trigger validation ...
  return (
    <FormControl
      id={id}
      isInvalid={errors[name]?.message}
      isRequired={fieldProps.required}
    >
      <FormLabel htmlFor={id} mb="0.5">
        {label}
      </FormLabel>
      {input}
      <ErrorMessage error={errors[name]?.message}></ErrorMessage>
    </FormControl>
  );
};

export default FieldInput;
