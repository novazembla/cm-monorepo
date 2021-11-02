import React from "react";
import { FieldInput, FieldRow, FieldTextEditor } from "~/components/forms";
import { Text, Box } from "@chakra-ui/react";

import {
  getSettingsFieldDefinitions,
  AppSettingsFieldKeys,
  AppSettingField,
} from "~/config";

import { findSettingDbValueByKey } from "../moduleConfig";
import { useTranslation } from "react-i18next";

export const UpdateForm = ({ data, errors }: { data?: any; errors?: any }) => {
  const { t } = useTranslation();
  const settingsFieldDefinitions = getSettingsFieldDefinitions();

  if (!data) return <></>;

  return (
    <>
      {Object.entries(settingsFieldDefinitions).map(
        ([settingKey, fieldDefinition], i) => {
          const value = findSettingDbValueByKey(
            settingKey as AppSettingsFieldKeys,
            data,
            fieldDefinition as AppSettingField
          );

          if (
            fieldDefinition.formComponent &&
            fieldDefinition.getFormComponentProps
          )
            return (
              <Box mt="4" _first={{ mt: 0 }} w="100%" key={i}>
                <Text>{t(fieldDefinition.label)}</Text>
                <Box mt="0.5" w="100%">
                  {React.createElement(fieldDefinition.formComponent, {
                    key: i,
                    ...fieldDefinition.getFormComponentProps(
                      fieldDefinition,
                      value
                    ),
                  })}
                </Box>
              </Box>
            );

          if (fieldDefinition.type === "texteditor")
            return (
              <FieldRow key={i}>
                <FieldTextEditor
                  type="basic"
                  name={settingKey}
                  id={settingKey}
                  label={t(fieldDefinition.label)}
                  isRequired={fieldDefinition.required}
                  settings={{
                    defaultValue: value,
                  }}
                />
              </FieldRow>
            );
          return (
            <FieldRow key={i}>
              <FieldInput
                name={settingKey}
                id={settingKey}
                type={fieldDefinition.type}
                label={t(fieldDefinition.label)}
                isRequired={fieldDefinition.required}
                settings={{
                  defaultValue: value,
                }}
              />
            </FieldRow>
          );
        }
      )}
    </>
  );
};
export default UpdateForm;
