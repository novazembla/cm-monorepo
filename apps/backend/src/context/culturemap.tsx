import React, { Context, createContext, ReactNode } from "react";
import merge from "deepmerge";
import CMSettings from "~/config/culturemap";

export type CultureMapSettings = {
  apiUrl?: string | undefined;
  apiDomain?: string | undefined;
};

// initial state
const settingsDefault: CultureMapSettings = {
  apiUrl: `${process.env.REACT_APP_API_GRAPHQL_URL}`,
  apiDomain: `${process.env.REACT_APP_API_DOMAIN}`,
};

let settings: CultureMapSettings = {};

try {
  settings = merge(settingsDefault, CMSettings);
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the config folder"
  );
}

type Props = {
  children?: ReactNode;
};

// create context
export const CulturemapContext: Context<any> = createContext({});

// context provider
export const CulturemapContextProvider = ({ children }: Props) => {
  return (
    <CulturemapContext.Provider value={settings}>
      {children}
    </CulturemapContext.Provider>
  );
};

export const getCulturemapSettings = (): CultureMapSettings => settings;

CulturemapContextProvider.defaultProps = {
  children: null,
};

const context = { CulturemapContext, CulturemapContextProvider };
export default context;
