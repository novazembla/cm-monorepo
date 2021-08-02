import { settingsQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";
import { Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";
import { getSettingsFieldDefinitions, AppSettingsFieldKeys } from "~/config";

import { moduleRootPath } from "./config";
import React from "react";

const Setting = ({
  setting,
  valueInDb,
}: {
  setting: AppSettingsFieldKeys;
  valueInDb: any;
}) => {
  const settingsFieldDefinitions = getSettingsFieldDefinitions();
  const { t } = useTranslation();

  let value = valueInDb ?? settingsFieldDefinitions[setting]?.default; 

  let print;

  if (settingsFieldDefinitions[setting]?.printComponent) {
    let props = value
    if (typeof value !== 'object')
      props = {value}

    print = React.createElement(settingsFieldDefinitions[setting]?.printComponent as React.FC<any>, props);
  } else {
    if (typeof value === 'object') {
      print = Object.entries(value).map(([, value]) => value).join(", ");
    } else {
      if (!value)
        value = <Text color="red.600">{t("settings.empty.defaultvalue", "Empty! Please update the settings")}</Text>

      print = value;
    }
  }

  return (
    <Stat mb="4">
      <StatLabel>
        {t(settingsFieldDefinitions[setting]?.label ?? "settings.error.label")}
      </StatLabel>
      <StatNumber mt="-1">{print}</StatNumber>
    </Stat>
  );
};

const Index = () => {
  const settingsFieldDefinitions = getSettingsFieldDefinitions();
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(settingsQueryGQL);

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.settings.title", "Setting"),
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

  console.log(settingsFieldDefinitions);

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        {data?.settings &&
          Object.entries(settingsFieldDefinitions).map(
            ([setting, fielsDefinition], i) => {
              console.log(setting, fielsDefinition);
              return (
                <Setting
                  key={i}
                  valueInDb={data?.settings[setting as AppSettingsFieldKeys]}
                  setting={setting as AppSettingsFieldKeys}
                />
              );
            }
          )}
      </ModulePage>
    </>
  );
};
export default Index;
