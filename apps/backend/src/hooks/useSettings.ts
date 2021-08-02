import { useTypedSelector } from ".";
import { AppSettingsFieldKeys, AppSetting } from "~/config";

export const useSettings = (): Record<AppSettingsFieldKeys, any> => {
  const { settings } = useTypedSelector(({ settings }) => settings);

  return Object.keys(settings).reduce((acc, key) => ({
    ...acc,
    [key]: (settings[key as AppSettingsFieldKeys] as AppSetting).value
  }),{} as Record<AppSettingsFieldKeys, any>);
};
