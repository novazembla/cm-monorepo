import React from "react";
import { settingsQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";
import { Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";
import {
  getSettingsFieldDefinitions,
  AppSettingsFieldKeys,
  AppSettingField,
  AppSettingsFieldDefinitions,
} from "~/config";

import { moduleRootPath, findSettingDbValueByKey } from "./moduleConfig";

const Setting = ({
  setting,
  valueInDb,
}: {
  setting: AppSettingsFieldKeys;
  valueInDb: any;
}) => {
  const settingsFieldDefinitions: AppSettingsFieldDefinitions =
    getSettingsFieldDefinitions();
  const { t } = useTranslation();

  let value = valueInDb ?? settingsFieldDefinitions[setting]?.defaultValue;

  let print;

  if (settingsFieldDefinitions[setting]?.printComponent) {
    let props = value;
    if (typeof value !== "object") props = { value };

    print = React.createElement(
      settingsFieldDefinitions[setting]?.printComponent as React.FC<any>,
      props
    );
  } else {
    if (typeof value === "object") {
      print = Object.entries(value)
        .map(([, value]) => value)
        .join(", ");
    } else {
      if (!value)
        value = (
          <Text color="red.600">
            {t(
              "settings.empty.defaultvalue",
              "Empty! Please update the settings"
            )}
          </Text>
        );

      print = value;
    }
  }

  return (
    <Stat mb="4">
      <StatLabel fontSize="md">
        {settingsFieldDefinitions[setting]?.label
          ? t(`${settingsFieldDefinitions[setting]?.label}`)
          : t("settings.error.label")}
      </StatLabel>
      <StatNumber mt="-1">{print}</StatNumber>
    </Stat>
  );
};

const Index = () => {
  const settingsFieldDefinitions: AppSettingsFieldDefinitions =
    getSettingsFieldDefinitions();
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(settingsQueryGQL, {
    variables: {
      scope: "settings",
    },
  });

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.settings.title", "Settings"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: "/settings/update",
      label: t("module.settings.button.update", "Update settings"),
      userCan: "settingUpdate",
    },
  ];

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        {Array.isArray(data?.settings) &&
          Object.entries(settingsFieldDefinitions).map(
            ([settingKey, fieldDefinition], index: number) => {
              return (
                <Setting
                  key={index}
                  valueInDb={findSettingDbValueByKey(
                    settingKey as AppSettingsFieldKeys,
                    data.settings,
                    fieldDefinition as AppSettingField
                  )}
                  setting={settingKey as AppSettingsFieldKeys}
                />
              );
            }
          )}
      </ModulePage>
    </>
  );
};
export default Index;
