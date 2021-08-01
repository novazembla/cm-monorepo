import React, { Context, createContext, ReactNode } from "react";
import merge from "deepmerge";
import CMSettings from "../culturemap";

export type AppConfig = {
  apiUrl?: string | undefined;
  navigation?: {
    main: Array<object>;
    footer: Array<object>;
  };
  logos?: Array<object>;
};

// initial state
const settingsDefault: AppConfig = {
  apiUrl: `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
  navigation: {
    main: [],
    footer: [],
  },
  logos: [],
};

let settings: AppConfig = {};

try {
  settings = merge(settingsDefault, CMSettings);
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the root folder"
  );
}

type Props = {
  children?: ReactNode;
};

// create context
export const ConfigContext: Context<any> = createContext({});

// context provider
export const ConfigContextProvider = ({ children }: Props) => {
  return (
    <ConfigContext.Provider value={settings}>{children}</ConfigContext.Provider>
  );
};

export const getAppConfig = (): AppConfig => settings;

ConfigContextProvider.defaultProps = {
  children: null,
};

export default { ConfigContext, ConfigContextProvider };
