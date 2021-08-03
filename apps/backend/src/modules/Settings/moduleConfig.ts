import { AppSettingsFieldKeys, AppSettingField } from "~/config";

export const moduleRootPath = "/settings";

export const findSettingDbValueByKey = (key: AppSettingsFieldKeys, data: any, fieldDefinition: AppSettingField) => {
  return data.find((setting: any) => setting.key === key)?.value?.json ?? fieldDefinition.defaultValue;
}

