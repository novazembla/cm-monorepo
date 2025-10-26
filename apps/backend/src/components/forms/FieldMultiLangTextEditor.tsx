import { chakra } from "@chakra-ui/react";

import TwoColFieldRow from "./TwoColFieldRow";
import { useConfig } from "~/hooks";
import FieldRow from "./FieldRow";
import { TextEditorTypes } from "./TextEditor";
import FieldTextEditor from "./FieldTextEditor";

export interface FieldMultiLangTextEditorSettings {
  required?: boolean;
  defaultRequired?: boolean;
  className?: string;
  placeholder?: string;
  defaultValues?: any;
  maxLength?: number;
}

export interface FieldMultiLangTextEditorFieldProps {
  required?: boolean;
  name?: string;
  id?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
}

export const FieldMultiLangTextEditor = ({
  settings,
  id,
  label,
  name,
  type,
  isRequired,
  // isDisabled,
  size = "small",
  activeLanguages,
}: {
  settings?: FieldMultiLangTextEditorSettings;
  id: string;
  size?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  type: TextEditorTypes;
  activeLanguages?: string[];
}) => {
  const config = useConfig();

  return (
    <TwoColFieldRow type="multilang">
      {(activeLanguages ?? config.activeLanguages) &&
        (activeLanguages ?? config.activeLanguages).map((lang: any) => {
          const field_id = `${id ? id : name}_${lang}`;
          const field_name = `${name}_${lang}`;
          const field_required =
            isRequired ||
            (lang === config.defaultLanguage &&
              settings?.defaultRequired === true);

          const defaultValue = settings?.defaultValues && typeof settings?.defaultValues === "object" && lang in settings.defaultValues ? settings.defaultValues[lang] : undefined;

          return (
            <FieldRow key={field_id}>
              <FieldTextEditor
                id={field_id}
                type={type}
                name={field_name}
                size={size}
                label={
                  <chakra.span>
                    {label} (
                    <chakra.span textTransform="uppercase">{lang}</chakra.span>)
                  </chakra.span>
                }
                isRequired={field_required}
                settings={{
                  className: settings?.className,
                  maxLength: settings?.maxLength,
                  defaultValue,
                }}
              />
            </FieldRow>
          );
        })}
    </TwoColFieldRow>
  );
};

export default FieldMultiLangTextEditor;
