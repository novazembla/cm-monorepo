import React from "react";
import { FieldInput, FieldRow } from "~/components/forms";

import { getSettingsFieldDefinitions, AppSettingsFieldKeys, AppSettingField } from "~/config";

import { findSettingDbValueByKey } from "../moduleConfig";

export const UpdateForm = ({ data, errors }: { data?: any; errors?: any }) => {
  const settingsFieldDefinitions = getSettingsFieldDefinitions();

  if (!data) return <></>;

  return (
    <>
      {Object.entries(settingsFieldDefinitions).map(
        ([settingKey, fieldDefinition], i) => {
          const value = findSettingDbValueByKey((settingKey as AppSettingsFieldKeys), data, (fieldDefinition as AppSettingField));

          if (
            fieldDefinition.formComponent &&
            fieldDefinition.getFormComponentProps
          )
            return React.createElement(fieldDefinition.formComponent, {
              key: i,
              ...fieldDefinition.getFormComponentProps(fieldDefinition, value),
            });
          return (
            <FieldRow key={i}>
              <FieldInput
                name={settingKey}
                id={settingKey}
                type={fieldDefinition.type}
                label={fieldDefinition.label}
                isRequired={fieldDefinition.required}
                settings={{
                  defaultValue: value
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
