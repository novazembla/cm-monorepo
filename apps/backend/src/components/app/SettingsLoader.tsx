import { useQuery, gql } from "@apollo/client";
import { getSettingsDefaultSettings, AppSetting, AppSettings } from "~/config";
import { useTypedDispatch } from "~/hooks";

import { settingsSet } from "~/redux/slices/settings";
import { modulesSet } from "~/redux/slices/modules";

const QUERY_SETTINGS = gql`
  query settings {
    settings(scope: "settings") {
      id
      key
      value
    }
    modules {
      id
      key
      name
      withTaxonomies
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              value: setting.value.json,
            },
          }),
          defaultSettings
        );
        dispatch(settingsSet(settings));
      }
      if (Array.isArray(data?.modules)) {
        const modules = data.modules.reduce(
          (acc: any, mod: any) => ({
            ...acc,
            [mod.key]: {
              id: mod.id,
              key: mod.key,
              name: mod.name,
              withTaxonomies: !!mod.withTaxonomies,
            },
          }),
          {}
        );
        dispatch(modulesSet(modules));
      }
    },
  });

  return <></>;
};
