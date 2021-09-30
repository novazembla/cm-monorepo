import { useFormContext } from "react-hook-form";

import { FormControl, FormLabel, Flex, Box } from "@chakra-ui/react";

import { TextEditor, FieldErrorMessage, TextEditorTypes } from ".";

export interface FieldTextEditorSettings {
  required?: boolean;
  defaultRequired?: boolean;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  maxLength?: number;
}

export const FieldTextEditor = ({
  settings,
  id,
  label,
  name,
  type,
  isRequired,
  isDisabled,
  size = "small",
}: {
  settings?: FieldTextEditorSettings;
  id: string;
  size?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string | React.ReactNode;
  name: string;
  type: TextEditorTypes;
}) => {
  const {
    formState: { errors },
    register,
    setValue,
  } = useFormContext();

  return (
    <FormControl
      id={id}
      className={settings?.className}
      isInvalid={errors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      <Flex direction={{ base: "column", mw: "row", t: "column" }}>
        <FormLabel
          htmlFor={id}
          mb="0.5"
          w={{ base: "100%", mw: "30%", t: "100%" }}
        >
          {label}
        </FormLabel>

        {isDisabled && <Box opacity={0.4} dangerouslySetInnerHTML={{
          __html: settings?.defaultValue
        }}></Box>}
        
        {!isDisabled && <TextEditor
          content={settings?.defaultValue ?? undefined}
          placeholder={settings?.placeholder}
          type={type}
          size={size}
          name={name}
          onChange={(content) => {
            setValue(name, content);
          }}
          isInvalid={errors[name]?.message}
          maxLength={settings?.maxLength}
        />}
        <input
          {...{ valid: !errors[name]?.message ? "valid" : undefined }}
          type="hidden"
          value={settings?.defaultValue}
          {...register(name, {
            required: isRequired,
          })}
        />
      </Flex>
      <FieldErrorMessage error={errors[name]?.message} />
    </FormControl>
  );
};

export default FieldTextEditor;
