import { useQuery, gql } from "@apollo/client";
import { getSettingsDefaultSettings, AppSetting, AppSettings } from "~/config";
import { useTypedDispatch } from "~/hooks";

import { settingsSet } from "~/redux/slices/settings";

const QUERY_SETTINGS = gql`
  query settings {
    settings {
      id
      key
      value
    }
  }
`;

export const SettingsLoader = ({ type = "full" }: { type?: string }) => {
  const dispatch = useTypedDispatch();

  useQuery(QUERY_SETTINGS, {
    onCompleted: (data) => {
      const defaultSettings: AppSettings = getSettingsDefaultSettings();

      if (Array.isArray(data?.settings)) {
        const settings = (data.settings as AppSetting[]).reduce(
          (acc, setting) => ({
            ...acc,
            [setting.key]: {
              key: setting.key,
              value: setting.value,
            },
          }),
          defaultSettings
        );
        dispatch(settingsSet(settings));
      }
    },
  });

  return <></>;
};
